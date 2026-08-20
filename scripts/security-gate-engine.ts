import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface Finding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  location: string;
  description: string;
}

interface ScanResult {
  scanner: string;
  findings: Finding[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  passed: boolean;
}

interface GateDecision {
  auditId: string;
  timestamp: string;
  commit: string;
  branch: string;
  version: string;
  decision: 'PASS' | 'FAIL';
  score: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  message: string;
}

const POLICY = {
  scoreWeights: {
    critical_finding: -30,
    high_finding: -15,
    medium_finding: -5,
    low_finding: -1,
    rls_pass: 15,
    rbac_pass: 15,
    secret_scan_pass: 20,
    dependency_scan_pass: 15,
    iac_scan_pass: 10,
    auth_tests_pass: 15,
    api_tests_pass: 10,
    base_score: 100,
    minimum_deploy_score: 70
  }
};

function generateUUID(): string {
  return crypto.randomUUID();
}

function calculateScore(results: ScanResult[], statuses: Record<string, string>): number {
  let score = POLICY.scoreWeights.base_score;
  
  // Calculate based on findings
  for (const result of results) {
    for (const finding of result.findings) {
      switch (finding.severity) {
        case 'CRITICAL':
          score += POLICY.scoreWeights.critical_finding;
          break;
        case 'HIGH':
          score += POLICY.scoreWeights.high_finding;
          break;
        case 'MEDIUM':
          score += POLICY.scoreWeights.medium_finding;
          break;
        case 'LOW':
          score += POLICY.scoreWeights.low_finding;
          break;
      }
    }
  }

  // Calculate based on CI job statuses
  if (statuses.secretScan === 'success') score += POLICY.scoreWeights.secret_scan_pass;
  if (statuses.depScan === 'success') score += POLICY.scoreWeights.dependency_scan_pass;
  if (statuses.iacScan === 'success') score += POLICY.scoreWeights.iac_scan_pass;
  if (statuses.securityTests === 'success') {
    score += POLICY.scoreWeights.auth_tests_pass;
    score += POLICY.scoreWeights.api_tests_pass;
    score += POLICY.scoreWeights.rbac_pass;
    score += POLICY.scoreWeights.rls_pass;
  }

  return score;
}

function shouldBlock(results: ScanResult[], score: number, statuses: Record<string, string>): { blocked: boolean; reason: string } {
  let hasCritical = false;
  let criticalCount = 0;
  
  for (const result of results) {
    for (const finding of result.findings) {
      if (finding.severity === 'CRITICAL') {
        hasCritical = true;
        criticalCount++;
      }
    }
  }

  if (hasCritical) {
    return { blocked: true, reason: `Found ${criticalCount} CRITICAL security findings.` };
  }

  if (statuses.secretScan === 'failure') {
    return { blocked: true, reason: 'Secret scan failed. Secrets detected in codebase.' };
  }
  
  if (statuses.depScan === 'failure') {
    return { blocked: true, reason: 'Dependency scan failed. Critical vulnerabilities found.' };
  }
  
  if (statuses.iacScan === 'failure') {
    return { blocked: true, reason: 'IaC security scan failed. Insecure infrastructure configuration.' };
  }
  
  if (statuses.securityTests === 'failure') {
    return { blocked: true, reason: 'Security tests failed. RLS, RBAC, or Auth issues detected.' };
  }

  if (score < POLICY.scoreWeights.minimum_deploy_score) {
    return { blocked: true, reason: `Security score (${score}) is below the minimum required (${POLICY.scoreWeights.minimum_deploy_score}).` };
  }

  return { blocked: false, reason: 'Passed all security gate checks.' };
}

function formatBlockMessage(decision: GateDecision, reason: string): string {
  return `DEPLOY BLOCKED — ISM SECURITY GATE

Release: ${decision.version}
Commit: ${decision.commit}

Critical Findings: ${decision.findings.critical}
High Findings: ${decision.findings.high}
Medium Findings: ${decision.findings.medium}
Low Findings: ${decision.findings.low}

Reason:
${reason}

Required Action:
Review and fix the critical findings, or request formal approval for exceptions. Rerun the pipeline after fixes are applied.

Security Audit ID:
${decision.auditId}

Deployment Status:
BLOCKED
`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config: any = {
    dryRun: false,
    mockData: false,
    commit: 'unknown',
    branch: 'unknown',
    version: 'unknown',
    scannerResults: '.',
    secretScanStatus: 'success',
    depScanStatus: 'success',
    qualityStatus: 'success',
    testsStatus: 'success',
    securityTestsStatus: 'success',
    iacStatus: 'success'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') config.dryRun = true;
    else if (arg === '--mock-data') config.mockData = true;
    else if (arg === '--commit') config.commit = args[++i];
    else if (arg === '--branch') config.branch = args[++i];
    else if (arg === '--version') config.version = args[++i];
    else if (arg === '--scanner-results') config.scannerResults = args[++i];
    else if (arg === '--secret-scan-status') config.secretScanStatus = args[++i];
    else if (arg === '--dep-scan-status') config.depScanStatus = args[++i];
    else if (arg === '--quality-status') config.qualityStatus = args[++i];
    else if (arg === '--tests-status') config.testsStatus = args[++i];
    else if (arg === '--security-tests-status') config.securityTestsStatus = args[++i];
    else if (arg === '--iac-status') config.iacStatus = args[++i];
  }
  return config;
}

function main() {
  const config = parseArgs();
  
  let results: ScanResult[] = [];
  
  if (config.mockData) {
    results.push({
      scanner: 'mock-scanner',
      passed: true,
      severity: 'NONE',
      findings: []
    });
  } else {
    // Attempt to read JSON results if any exist in the scannerResults directory
    try {
      const files = fs.readdirSync(config.scannerResults);
      for (const file of files) {
        if (file.endsWith('.json') && file.includes('audit')) {
          try {
            const content = fs.readFileSync(path.join(config.scannerResults, file), 'utf8');
            const data = JSON.parse(content);
            if (data && data.findings && Array.isArray(data.findings)) {
              results.push(data);
            }
          } catch (e) {
            // ignore unparseable files
          }
        }
      }
    } catch (e) {
      console.warn(`Could not read scanner results from ${config.scannerResults}`);
    }
  }

  const statuses = {
    secretScan: config.secretScanStatus,
    depScan: config.depScanStatus,
    quality: config.qualityStatus,
    tests: config.testsStatus,
    securityTests: config.securityTestsStatus,
    iacScan: config.iacStatus
  };

  const score = calculateScore(results, statuses);
  const blockCheck = shouldBlock(results, score, statuses);
  
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  for (const r of results) {
    for (const f of r.findings) {
      if (f.severity === 'CRITICAL') criticalCount++;
      else if (f.severity === 'HIGH') highCount++;
      else if (f.severity === 'MEDIUM') mediumCount++;
      else if (f.severity === 'LOW') lowCount++;
    }
  }

  const decision: GateDecision = {
    auditId: generateUUID(),
    timestamp: new Date().toISOString(),
    commit: config.commit,
    branch: config.branch,
    version: config.version,
    decision: blockCheck.blocked ? 'FAIL' : 'PASS',
    score: score,
    findings: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount
    },
    message: blockCheck.blocked ? blockCheck.reason : 'All security checks passed.'
  };

  const reportsDir = path.join(process.cwd(), 'SECURITY', 'audit-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `audit-${decision.auditId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(decision, null, 2), 'utf8');

  console.log(`Security Audit ID: ${decision.auditId}`);
  console.log(`Security Score: ${score}`);
  console.log(`Decision: ${decision.decision}`);
  console.log(`Message: ${decision.message}`);

  if (decision.decision === 'FAIL') {
    console.error(formatBlockMessage(decision, blockCheck.reason));
    if (!config.dryRun) {
      process.exit(1);
    }
  } else {
    console.log('✅ SECURITY GATE PASSED. DEPLOYMENT APPROVED.');
    process.exit(0);
  }
}

main();
