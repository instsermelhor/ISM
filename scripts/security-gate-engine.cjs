"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var POLICY = {
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
function generateUUID() {
    return crypto.randomUUID();
}
function calculateScore(results, statuses) {
    var score = POLICY.scoreWeights.base_score;
    // Calculate based on findings
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var result = results_1[_i];
        for (var _a = 0, _b = result.findings; _a < _b.length; _a++) {
            var finding = _b[_a];
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
    if (statuses.secretScan === 'success')
        score += POLICY.scoreWeights.secret_scan_pass;
    if (statuses.depScan === 'success')
        score += POLICY.scoreWeights.dependency_scan_pass;
    if (statuses.iacScan === 'success')
        score += POLICY.scoreWeights.iac_scan_pass;
    if (statuses.securityTests === 'success') {
        score += POLICY.scoreWeights.auth_tests_pass;
        score += POLICY.scoreWeights.api_tests_pass;
        score += POLICY.scoreWeights.rbac_pass;
        score += POLICY.scoreWeights.rls_pass;
    }
    return score;
}
function shouldBlock(results, score, statuses) {
    var hasCritical = false;
    var criticalCount = 0;
    for (var _i = 0, results_2 = results; _i < results_2.length; _i++) {
        var result = results_2[_i];
        for (var _a = 0, _b = result.findings; _a < _b.length; _a++) {
            var finding = _b[_a];
            if (finding.severity === 'CRITICAL') {
                hasCritical = true;
                criticalCount++;
            }
        }
    }
    if (hasCritical) {
        return { blocked: true, reason: "Found ".concat(criticalCount, " CRITICAL security findings.") };
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
        return { blocked: true, reason: "Security score (".concat(score, ") is below the minimum required (").concat(POLICY.scoreWeights.minimum_deploy_score, ").") };
    }
    return { blocked: false, reason: 'Passed all security gate checks.' };
}
function formatBlockMessage(decision, reason) {
    return "DEPLOY BLOCKED \u2014 ISM SECURITY GATE\n\nRelease: ".concat(decision.version, "\nCommit: ").concat(decision.commit, "\n\nCritical Findings: ").concat(decision.findings.critical, "\nHigh Findings: ").concat(decision.findings.high, "\nMedium Findings: ").concat(decision.findings.medium, "\nLow Findings: ").concat(decision.findings.low, "\n\nReason:\n").concat(reason, "\n\nRequired Action:\nReview and fix the critical findings, or request formal approval for exceptions. Rerun the pipeline after fixes are applied.\n\nSecurity Audit ID:\n").concat(decision.auditId, "\n\nDeployment Status:\nBLOCKED\n");
}
function parseArgs() {
    var args = process.argv.slice(2);
    var config = {
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
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg === '--dry-run')
            config.dryRun = true;
        else if (arg === '--mock-data')
            config.mockData = true;
        else if (arg === '--commit')
            config.commit = args[++i];
        else if (arg === '--branch')
            config.branch = args[++i];
        else if (arg === '--version')
            config.version = args[++i];
        else if (arg === '--scanner-results')
            config.scannerResults = args[++i];
        else if (arg === '--secret-scan-status')
            config.secretScanStatus = args[++i];
        else if (arg === '--dep-scan-status')
            config.depScanStatus = args[++i];
        else if (arg === '--quality-status')
            config.qualityStatus = args[++i];
        else if (arg === '--tests-status')
            config.testsStatus = args[++i];
        else if (arg === '--security-tests-status')
            config.securityTestsStatus = args[++i];
        else if (arg === '--iac-status')
            config.iacStatus = args[++i];
    }
    return config;
}
function main() {
    var config = parseArgs();
    var results = [];
    if (config.mockData) {
        results.push({
            scanner: 'mock-scanner',
            passed: true,
            severity: 'NONE',
            findings: []
        });
    }
    else {
        // Attempt to read JSON results if any exist in the scannerResults directory
        try {
            var files = fs.readdirSync(config.scannerResults);
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                if (file.endsWith('.json') && file.includes('audit')) {
                    try {
                        var content = fs.readFileSync(path.join(config.scannerResults, file), 'utf8');
                        var data = JSON.parse(content);
                        if (data && data.findings && Array.isArray(data.findings)) {
                            results.push(data);
                        }
                    }
                    catch (e) {
                        // ignore unparseable files
                    }
                }
            }
        }
        catch (e) {
            console.warn("Could not read scanner results from ".concat(config.scannerResults));
        }
    }
    var statuses = {
        secretScan: config.secretScanStatus,
        depScan: config.depScanStatus,
        quality: config.qualityStatus,
        tests: config.testsStatus,
        securityTests: config.securityTestsStatus,
        iacScan: config.iacStatus
    };
    var score = calculateScore(results, statuses);
    var blockCheck = shouldBlock(results, score, statuses);
    var criticalCount = 0;
    var highCount = 0;
    var mediumCount = 0;
    var lowCount = 0;
    for (var _a = 0, results_3 = results; _a < results_3.length; _a++) {
        var r = results_3[_a];
        for (var _b = 0, _c = r.findings; _b < _c.length; _b++) {
            var f = _c[_b];
            if (f.severity === 'CRITICAL')
                criticalCount++;
            else if (f.severity === 'HIGH')
                highCount++;
            else if (f.severity === 'MEDIUM')
                mediumCount++;
            else if (f.severity === 'LOW')
                lowCount++;
        }
    }
    var decision = {
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
    var reportsDir = path.join(process.cwd(), 'SECURITY', 'audit-reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
    var reportPath = path.join(reportsDir, "audit-".concat(decision.auditId, ".json"));
    fs.writeFileSync(reportPath, JSON.stringify(decision, null, 2), 'utf8');
    console.log("Security Audit ID: ".concat(decision.auditId));
    console.log("Security Score: ".concat(score));
    console.log("Decision: ".concat(decision.decision));
    console.log("Message: ".concat(decision.message));
    if (decision.decision === 'FAIL') {
        console.error(formatBlockMessage(decision, blockCheck.reason));
        if (!config.dryRun) {
            process.exit(1);
        }
    }
    else {
        console.log('✅ SECURITY GATE PASSED. DEPLOYMENT APPROVED.');
        process.exit(0);
    }
}
main();
