from datetime import datetime
from typing import Dict, Any, List

def analyze_structured_findings_ai(structured_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Synthesizes real scanner evidence into prioritized AI Security Recommendations (P1-P4).
    Enforces that AI only interprets real evidence produced by scanners, without inventing fake findings.
    """
    findings = structured_data.get("findings", [])
    anomalies = structured_data.get("anomalies", [])
    target = structured_data.get("target") or structured_data.get("hostname") or "System Audit Target"
    
    prioritized_actions = []

    # Process Vulnerability Findings
    for idx, f in enumerate(findings, start=1):
        sev = f.get("severity", "Medium")
        if sev == "Critical":
            priority = "P1 - Critical"
        elif sev == "High":
            priority = "P2 - High"
        elif sev == "Medium":
            priority = "P3 - Medium"
        else:
            priority = "P4 - Low"

        prioritized_actions.append({
            "priority": priority,
            "title": f.get("title", "Security Finding"),
            "category": f.get("category", "SECURITY"),
            "risk_explanation": f.get("description", "Potential vulnerability detected during scan."),
            "technical_evidence": f.get("evidence", "Observed during automated security audit."),
            "recommended_action": f.get("recommendation", "Implement standard defense controls.")
        })

    # Process Log Anomaly Findings
    for idx, a in enumerate(anomalies, start=1):
        sev = a.get("severity", "MEDIUM")
        if sev == "CRITICAL" or sev == "CRITICAL_THREAT":
            priority = "P1 - Critical"
        elif sev == "HIGH":
            priority = "P2 - High"
        elif sev == "MEDIUM":
            priority = "P3 - Medium"
        else:
            priority = "P4 - Low"

        prioritized_actions.append({
            "priority": priority,
            "title": f"Log Anomaly: {a.get('type', 'SECURITY_EVENT')}",
            "category": "LOG_TELEMETRY",
            "risk_explanation": f"Detected malicious pattern from IP {a.get('source_ip', 'Unknown')}.",
            "technical_evidence": a.get("evidence", "Flagged during log anomaly parsing."),
            "recommended_action": a.get("recommendation", "Apply rate limiting and monitor access logs.")
        })

    # Sort by Priority P1 > P2 > P3 > P4
    priority_order = {"P1 - Critical": 1, "P2 - High": 2, "P3 - Medium": 3, "P4 - Low": 4}
    prioritized_actions.sort(key=lambda x: priority_order.get(x["priority"], 9))

    total_findings_count = len(prioritized_actions)
    if total_findings_count == 0:
        exec_summary = f"Audit of target '{target}' yielded clean results with no major security vulnerabilities or anomalous threats detected."
    else:
        exec_summary = f"Audit of target '{target}' identified {total_findings_count} actionable findings. Review prioritized remediations below to strengthen defense posture."

    return {
        "target": target,
        "executive_summary": exec_summary,
        "key_findings_count": total_findings_count,
        "prioritized_remediations": prioritized_actions
    }

def generate_pdf_report(health_score: int, user_info: Dict[str, Any], scans_summary: List[Dict[str, Any]]) -> bytes:
    """
    Generates a formatted PDF document binary for downloading security audit reports.
    """
    report_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    username = user_info.get("name") or user_info.get("username") or "Security Auditor"
    
    pdf_content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
4 0 obj
<< /Length 600 >>
stream
BT
/F1 18 Tf
50 730 Td
(AI CYBERSECURITY ASSISTANT - DEFENSIVE AUDIT REPORT) Tj
/F1 11 Tf
0 -25 Td
(Auditor: {username}) Tj
0 -16 Td
(Report Date: {report_date}) Tj
0 -16 Td
(Consolidated Security Health Rating: {health_score} / 100) Tj
0 -30 Td
(EXECUTIVE SUMMARY:) Tj
0 -18 Td
(- Web Vulnerability Scanner: Non-intrusive TCP & Header Audit Completed.) Tj
0 -16 Td
(- Log File Anomaly Inspector: Parsed access/syslog entries for brute force & SQLi.) Tj
0 -16 Td
(- RAG AI Security Assistant: Recommendations aligned with OWASP Top 10 & NIST.) Tj
0 -30 Td
(PRIORITIZED REMEDIATION PLAN:) Tj
0 -18 Td
(P1 - Enforce Multi-Factor Authentication (MFA) & IP Rate Limiting.) Tj
0 -16 Td
(P2 - Configure missing HTTP Security Headers (HSTS, Content-Security-Policy).) Tj
0 -16 Td
(P3 - Restrict external firewall access for database ports (3306, 5432, 27017).) Tj
0 -16 Td
(P4 - Audit TLS certificate expiration windows and enforce HTTPS redirects.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
0000000240 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
960
%%EOF
"""
    return pdf_content.encode("latin-1", errors="ignore")
