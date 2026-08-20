import * as fs from "fs";
import * as path from "path";

interface Finding {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  location: string;
  description: string;
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function auditFirestoreRules(projectRoot: string): Finding[] {
  const rulesPath = path.join(projectRoot, "firestore.rules");
  const findings: Finding[] = [];

  if (!fs.existsSync(rulesPath)) {
    return findings;
  }

  const content = fs.readFileSync(rulesPath, "utf8");
  
  if (/allow\s+read,\s*write\s*:\s*if\s+true\s*;/.test(content)) {
    findings.push({
      id: generateId("FS"),
      title: "Unrestricted Read/Write Access",
      severity: "CRITICAL",
      category: "Database Security",
      location: "firestore.rules",
      description: "Found allow read, write: if true; which allows anyone to read and write database."
    });
  }

  if (/allow\s+write\s*:\s*if\s+true\s*;/.test(content)) {
    findings.push({
      id: generateId("FS"),
      title: "Unrestricted Write Access",
      severity: "CRITICAL",
      category: "Database Security",
      location: "firestore.rules",
      description: "Found allow write: if true; which allows anyone to write to database."
    });
  }

  const sensitiveCollections = ["donations", "leads", "users", "beneficiaries"];
  for (const coll of sensitiveCollections) {
    const regex = new RegExp(`match\\s+/api/v1/projects/[^/]+/${coll}\\s*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;`, "i");
    if (regex.test(content) || new RegExp(`match\\s+/${coll}/\\{.*?\\}\\s*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;`, "i").test(content) || new RegExp(`match\\s+.*${coll}.*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;`, "i").test(content)) {
      findings.push({
        id: generateId("FS"),
        title: `Unrestricted Read Access on Sensitive Collection (${coll})`,
        severity: "HIGH",
        category: "Database Security",
        location: "firestore.rules",
        description: `Found allow read: if true; on sensitive collection ${coll}.`
      });
    }
  }

  return findings;
}

function auditFirebaseJson(projectRoot: string): Finding[] {
  const configPath = path.join(projectRoot, "firebase.json");
  const findings: Finding[] = [];

  if (!fs.existsSync(configPath)) {
    return findings;
  }

  const content = fs.readFileSync(configPath, "utf8");
  let data: any;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return findings;
  }

  if (data.hosting) {
    const hostings = Array.isArray(data.hosting) ? data.hosting : [data.hosting];
    for (const hosting of hostings) {
      const siteName = hosting.site || "default-site";
      if (hosting.headers) {
        let hasCSP = false;
        let hasSTS = false;
        let hasXCTO = false;
        let hasXFO = false;
        let hasRP = false;
        let hasWildcardCORS = false;
        let stsValue = "";
        let cspValue = "";

        for (const headerDef of hosting.headers) {
          if (headerDef.headers) {
            for (const h of headerDef.headers) {
              const key = h.key?.toLowerCase();
              const val = h.value?.toLowerCase();
              if (key === "content-security-policy") {
                hasCSP = true;
                cspValue = h.value || "";
              }
              if (key === "strict-transport-security") {
                hasSTS = true;
                stsValue = h.value || "";
              }
              if (key === "x-content-type-options") hasXCTO = true;
              if (key === "x-frame-options") hasXFO = true;
              if (key === "referrer-policy") hasRP = true;
              if (key === "access-control-allow-origin" && val === "*") hasWildcardCORS = true;
            }
          }
        }

        if (!hasCSP) {
          findings.push({ id: generateId("FB"), title: `Missing Content-Security-Policy on ${siteName}`, severity: "HIGH", category: "Security Headers", location: "firebase.json", description: "Missing CSP header." });
        } else {
          if (!cspValue.includes("upgrade-insecure-requests")) {
            findings.push({ id: generateId("FB"), title: `CSP missing upgrade-insecure-requests on ${siteName}`, severity: "HIGH", category: "Transport Security", location: "firebase.json", description: "CSP should include upgrade-insecure-requests directive to prevent mixed content." });
          }
          if (cspValue.includes("http://")) {
            findings.push({ id: generateId("FB"), title: `Insecure HTTP URL in CSP on ${siteName}`, severity: "HIGH", category: "Transport Security", location: "firebase.json", description: "CSP contains unencrypted http:// origin." });
          }
          if (cspValue.includes("ws://")) {
            findings.push({ id: generateId("FB"), title: `Insecure WebSocket (ws://) in CSP on ${siteName}`, severity: "HIGH", category: "Transport Security", location: "firebase.json", description: "CSP contains unencrypted ws:// origin." });
          }
        }

        if (!hasSTS) {
          findings.push({ id: generateId("FB"), title: `Missing Strict-Transport-Security on ${siteName}`, severity: "CRITICAL", category: "Transport Security", location: "firebase.json", description: "Missing Strict-Transport-Security header." });
        } else {
          const maxAgeMatch = stsValue.match(/max-age=(\\d+)/i);
          const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
          if (maxAge < 31536000) {
            findings.push({ id: generateId("FB"), title: `HSTS max-age insufficient on ${siteName}`, severity: "HIGH", category: "Transport Security", location: "firebase.json", description: `HSTS max-age is ${maxAge}s, minimum required is 31536000s (1 year). Recommended is 63072000s.` });
          }
          if (!stsValue.toLowerCase().includes("includesubdomains")) {
            findings.push({ id: generateId("FB"), title: `HSTS missing includeSubDomains on ${siteName}`, severity: "HIGH", category: "Transport Security", location: "firebase.json", description: "HSTS header must include includeSubDomains." });
          }
          if (!stsValue.toLowerCase().includes("preload")) {
            findings.push({ id: generateId("FB"), title: `HSTS missing preload on ${siteName}`, severity: "MEDIUM", category: "Transport Security", location: "firebase.json", description: "HSTS header should include preload directive." });
          }
        }

        if (!hasXCTO) findings.push({ id: generateId("FB"), title: `Missing X-Content-Type-Options on ${siteName}`, severity: "MEDIUM", category: "Security Headers", location: "firebase.json", description: "Missing X-Content-Type-Options header." });
        if (!hasXFO) findings.push({ id: generateId("FB"), title: `Missing X-Frame-Options on ${siteName}`, severity: "MEDIUM", category: "Security Headers", location: "firebase.json", description: "Missing X-Frame-Options header." });
        if (!hasRP) findings.push({ id: generateId("FB"), title: `Missing Referrer-Policy on ${siteName}`, severity: "LOW", category: "Security Headers", location: "firebase.json", description: "Missing Referrer-Policy header." });
        if (hasWildcardCORS) findings.push({ id: generateId("FB"), title: `Wildcard CORS on ${siteName}`, severity: "HIGH", category: "Security Headers", location: "firebase.json", description: "Access-Control-Allow-Origin: * found." });
      }
    }
  }

  return findings;
}

function auditEnvExample(projectRoot: string): Finding[] {
  const envPath = path.join(projectRoot, ".env.example");
  const findings: Finding[] = [];

  if (!fs.existsSync(envPath)) {
    return findings;
  }

  const content = fs.readFileSync(envPath, "utf8");
  if (/AIza[0-9A-Za-z-_]{35}/.test(content) || /(?:sk_live_|sk_test_)[0-9a-zA-Z]{24}/.test(content)) {
    findings.push({
      id: generateId("ENV"),
      title: "Real Secrets in .env.example",
      severity: "CRITICAL",
      category: "Secret Management",
      location: ".env.example",
      description: "Found patterns that look like real API keys or secrets in .env.example."
    });
  }

  return findings;
}

function main() {
  const projectRoot = process.cwd();
  
  let outputFile = "iac-audit-results.json";
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--output");
  if (outIndex !== -1 && args.length > outIndex + 1) {
    outputFile = args[outIndex + 1];
  }

  const findings: Finding[] = [
    ...auditFirestoreRules(projectRoot),
    ...auditFirebaseJson(projectRoot),
    ...auditEnvExample(projectRoot)
  ];

  let hasBlocking = false;
  let severityLevel = "NONE";
  
  for (const f of findings) {
    if (f.severity === "CRITICAL" || f.severity === "HIGH") {
      hasBlocking = true;
    }
    if (f.severity === "CRITICAL") severityLevel = "CRITICAL";
    else if (f.severity === "HIGH" && severityLevel !== "CRITICAL") severityLevel = "HIGH";
    else if (f.severity === "MEDIUM" && (severityLevel === "NONE" || severityLevel === "LOW")) severityLevel = "MEDIUM";
    else if (f.severity === "LOW" && severityLevel === "NONE") severityLevel = "LOW";
  }

  const result = {
    scanner: "custom_ism_iac_auditor",
    timestamp: new Date().toISOString(),
    passed: !hasBlocking,
    severity: severityLevel,
    findings
  };

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");
  console.log(`IaC Audit completed. Found ${findings.length} findings.`);
  if (hasBlocking) {
    console.error("Blocking security findings detected in IaC configuration.");
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
