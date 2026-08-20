"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function generateId(prefix) {
    return "".concat(prefix, "-").concat(Math.random().toString(36).substring(2, 8).toUpperCase());
}
function auditFirestoreRules(projectRoot) {
    var rulesPath = path.join(projectRoot, 'firestore.rules');
    var findings = [];
    if (!fs.existsSync(rulesPath)) {
        return findings;
    }
    var content = fs.readFileSync(rulesPath, 'utf8');
    if (/allow\s+read,\s*write\s*:\s*if\s+true\s*;/.test(content)) {
        findings.push({
            id: generateId('FS'),
            title: 'Unrestricted Read/Write Access',
            severity: 'CRITICAL',
            category: 'Database Security',
            location: 'firestore.rules',
            description: 'Found allow read, write: if true; which allows anyone to read and write database.'
        });
    }
    if (/allow\s+write\s*:\s*if\s+true\s*;/.test(content)) {
        findings.push({
            id: generateId('FS'),
            title: 'Unrestricted Write Access',
            severity: 'CRITICAL',
            category: 'Database Security',
            location: 'firestore.rules',
            description: 'Found allow write: if true; which allows anyone to write to database.'
        });
    }
    var sensitiveCollections = ['donations', 'leads', 'users', 'beneficiaries'];
    for (var _i = 0, sensitiveCollections_1 = sensitiveCollections; _i < sensitiveCollections_1.length; _i++) {
        var coll = sensitiveCollections_1[_i];
        var regex = new RegExp("match\\s+/api/v1/projects/[^/]+/".concat(coll, "\\s*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;"), 'i');
        if (regex.test(content) || new RegExp("match\\s+/".concat(coll, "/\\{.*?\\}\\s*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;"), 'i').test(content) || new RegExp("match\\s+.*".concat(coll, ".*\\{[^}]*allow\\s+read\\s*:\\s*if\\s+true\\s*;"), 'i').test(content)) {
            findings.push({
                id: generateId('FS'),
                title: "Unrestricted Read Access on Sensitive Collection (".concat(coll, ")"),
                severity: 'HIGH',
                category: 'Database Security',
                location: "firestore.rules",
                description: "Found allow read: if true; on sensitive collection ".concat(coll, ".")
            });
        }
    }
    return findings;
}
function auditFirebaseJson(projectRoot) {
    var _a, _b;
    var configPath = path.join(projectRoot, 'firebase.json');
    var findings = [];
    if (!fs.existsSync(configPath)) {
        return findings;
    }
    var content = fs.readFileSync(configPath, 'utf8');
    var data;
    try {
        data = JSON.parse(content);
    }
    catch (e) {
        return findings;
    }
    if (data.hosting) {
        var hostings = Array.isArray(data.hosting) ? data.hosting : [data.hosting];
        for (var _i = 0, hostings_1 = hostings; _i < hostings_1.length; _i++) {
            var hosting = hostings_1[_i];
            if (hosting.headers) {
                var hasCSP = false;
                var hasSTS = false;
                var hasXCTO = false;
                var hasXFO = false;
                var hasRP = false;
                var hasWildcardCORS = false;
                for (var _c = 0, _d = hosting.headers; _c < _d.length; _c++) {
                    var headerDef = _d[_c];
                    if (headerDef.headers) {
                        for (var _e = 0, _f = headerDef.headers; _e < _f.length; _e++) {
                            var h = _f[_e];
                            var key = (_a = h.key) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                            var val = (_b = h.value) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                            if (key === 'content-security-policy')
                                hasCSP = true;
                            if (key === 'strict-transport-security')
                                hasSTS = true;
                            if (key === 'x-content-type-options')
                                hasXCTO = true;
                            if (key === 'x-frame-options')
                                hasXFO = true;
                            if (key === 'referrer-policy')
                                hasRP = true;
                            if (key === 'access-control-allow-origin' && val === '*')
                                hasWildcardCORS = true;
                        }
                    }
                }
                if (!hasCSP)
                    findings.push({ id: generateId('FB'), title: 'Missing Content-Security-Policy', severity: 'HIGH', category: 'Security Headers', location: 'firebase.json', description: 'Missing CSP header.' });
                if (!hasSTS)
                    findings.push({ id: generateId('FB'), title: 'Missing Strict-Transport-Security', severity: 'HIGH', category: 'Security Headers', location: 'firebase.json', description: 'Missing STS header.' });
                if (!hasXCTO)
                    findings.push({ id: generateId('FB'), title: 'Missing X-Content-Type-Options', severity: 'MEDIUM', category: 'Security Headers', location: 'firebase.json', description: 'Missing X-Content-Type-Options header.' });
                if (!hasXFO)
                    findings.push({ id: generateId('FB'), title: 'Missing X-Frame-Options', severity: 'MEDIUM', category: 'Security Headers', location: 'firebase.json', description: 'Missing X-Frame-Options header.' });
                if (!hasRP)
                    findings.push({ id: generateId('FB'), title: 'Missing Referrer-Policy', severity: 'LOW', category: 'Security Headers', location: 'firebase.json', description: 'Missing Referrer-Policy header.' });
                if (hasWildcardCORS)
                    findings.push({ id: generateId('FB'), title: 'Wildcard CORS', severity: 'HIGH', category: 'Security Headers', location: 'firebase.json', description: 'Access-Control-Allow-Origin: * found.' });
            }
        }
    }
    return findings;
}
function auditEnvExample(projectRoot) {
    var envPath = path.join(projectRoot, '.env.example');
    var findings = [];
    if (!fs.existsSync(envPath)) {
        return findings;
    }
    var content = fs.readFileSync(envPath, 'utf8');
    if (/AIza[0-9A-Za-z-_]{35}/.test(content) || /(?:sk_live_|sk_test_)[0-9a-zA-Z]{24}/.test(content)) {
        findings.push({
            id: generateId('ENV'),
            title: 'Real Secrets in .env.example',
            severity: 'CRITICAL',
            category: 'Secret Management',
            location: '.env.example',
            description: 'Found patterns that look like real API keys or secrets in .env.example.'
        });
    }
    return findings;
}
function main() {
    var projectRoot = process.cwd();
    var outputFile = 'iac-audit-results.json';
    var args = process.argv.slice(2);
    var outIndex = args.indexOf('--output');
    if (outIndex !== -1 && args.length > outIndex + 1) {
        outputFile = args[outIndex + 1];
    }
    var findings = __spreadArray(__spreadArray(__spreadArray([], auditFirestoreRules(projectRoot), true), auditFirebaseJson(projectRoot), true), auditEnvExample(projectRoot), true);
    var hasBlocking = false;
    var severityLevel = 'NONE';
    for (var _i = 0, findings_1 = findings; _i < findings_1.length; _i++) {
        var f = findings_1[_i];
        if (f.severity === 'CRITICAL' || f.severity === 'HIGH') {
            hasBlocking = true;
        }
        if (f.severity === 'CRITICAL')
            severityLevel = 'CRITICAL';
        else if (f.severity === 'HIGH' && severityLevel !== 'CRITICAL')
            severityLevel = 'HIGH';
        else if (f.severity === 'MEDIUM' && (severityLevel === 'NONE' || severityLevel === 'LOW'))
            severityLevel = 'MEDIUM';
        else if (f.severity === 'LOW' && severityLevel === 'NONE')
            severityLevel = 'LOW';
    }
    var result = {
        scanner: 'custom_ism_iac_auditor',
        timestamp: new Date().toISOString(),
        passed: !hasBlocking,
        severity: severityLevel,
        findings: findings
    };
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
    console.log("IaC Audit completed. Found ".concat(findings.length, " findings."));
    if (hasBlocking) {
        console.error('Blocking security findings detected in IaC configuration.');
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
main();
