import re
import urllib.parse
from typing import Dict, Any, List

# Regex Patterns for log line parsing
# 1. Combined / Common Log Format: IP - - [Timestamp] "METHOD PATH PROTOCOL" STATUS SIZE
WEB_LOG_PATTERN = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+\S+\s+\[(?P<time>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)(?:\s+(?P<protocol>\S+))?"\s+(?P<status>\d{3})\s+(?P<size>\S+)'
)

# 2. Syslog / Auth Log Format: Month Day Time Host Process: Message
AUTH_LOG_PATTERN = re.compile(
    r'^(?P<time>[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(?P<host>\S+)\s+(?P<process>\S+):\s+(?P<message>.+)'
)

# Sensitive Administrative Endpoints for Directory Scanning Detection
SENSITIVE_ENDPOINTS = [
    "/admin", "/wp-admin", "/phpmyadmin", "/server-status",
    "/.env", "/.git", "/config.json", "/db.sql", "/backup.zip",
    "/etc/passwd", "/api/v1/admin", "/wp-login.php"
]

# SQL Injection Signature Indicators
SQLI_SIGNATURES = [
    "union select", "<script>", "alert(", "drop table", "or 1=1",
    "exec(", "../", "/etc/passwd", "' or '", "select * from",
    "%27%20or%20", "%27or%27", "--", "/*", "*/", "waitfor delay"
]

def analyze_log_content(content_str: str) -> Dict[str, Any]:
    """
    Parses web access and auth log files and performs anomaly detection:
    - Failed login brute force tracking
    - SQL injection indicators
    - Sensitive endpoint / directory scanning
    - HTTP 5xx error spikes
    - Request rate anomalies
    Returns clean evidence-based structured results.
    """
    lines = content_str.strip().splitlines()
    total_lines = len(lines)
    
    if total_lines == 0:
        return {
            "lines_processed": 0,
            "malformed_lines": 0,
            "failed_logins": 0,
            "anomalies_detected": 0,
            "threat_rating": "CLEAN",
            "anomalies": [],
            "summary": "Empty log content submitted."
        }

    parsed_count = 0
    malformed_count = 0
    failed_logins = 0

    # Tracking structures per IP
    ip_failed_logins: Dict[str, List[Dict[str, Any]]] = {}
    ip_requests: Dict[str, int] = {}
    ip_sensitive_paths: Dict[str, set] = {}
    ip_sqli_attempts: Dict[str, List[Dict[str, Any]]] = {}
    ip_server_errors: Dict[str, List[Dict[str, Any]]] = {}

    anomalies: List[Dict[str, Any]] = []

    for idx, raw_line in enumerate(lines, start=1):
        line_str = raw_line.strip()
        if not line_str:
            continue

        web_match = WEB_LOG_PATTERN.match(line_str)
        auth_match = AUTH_LOG_PATTERN.match(line_str)

        if web_match:
            parsed_count += 1
            ip = web_match.group("ip")
            timestamp = web_match.group("time")
            method = web_match.group("method")
            path = web_match.group("path")
            status = int(web_match.group("status"))
            
            ip_requests[ip] = ip_requests.get(ip, 0) + 1

            # URL-decode path before parameter inspection
            decoded_path = urllib.parse.unquote(path)

            # 1. Failed Login Check (HTTP 401 or auth path failures)
            if status == 401 or ("login" in path.lower() and status in [400, 401, 403]):
                failed_logins += 1
                if ip not in ip_failed_logins:
                    ip_failed_logins[ip] = []
                ip_failed_logins[ip].append({
                    "line": idx,
                    "timestamp": timestamp,
                    "method": method,
                    "path": path,
                    "status": status
                })

            # 2. SQL Injection Indicators Check
            for sig in SQLI_SIGNATURES:
                if sig in decoded_path.lower():
                    if ip not in ip_sqli_attempts:
                        ip_sqli_attempts[ip] = []
                    ip_sqli_attempts[ip].append({
                        "line": idx,
                        "timestamp": timestamp,
                        "signature": sig,
                        "path": path
                    })
                    break

            # 3. Endpoint / Directory Scanning Check
            for sens in SENSITIVE_ENDPOINTS:
                if sens in decoded_path.lower():
                    if ip not in ip_sensitive_paths:
                        ip_sensitive_paths[ip] = set()
                    ip_sensitive_paths[ip].add(sens)

            # 4. HTTP 5xx Server Error Check
            if status >= 500:
                if ip not in ip_server_errors:
                    ip_server_errors[ip] = []
                ip_server_errors[ip].append({
                    "line": idx,
                    "timestamp": timestamp,
                    "path": path,
                    "status": status
                })

        elif auth_match or "failed password" in line_str.lower() or "authentication failure" in line_str.lower():
            parsed_count += 1
            timestamp = auth_match.group("time") if auth_match else "Syslog"
            msg = auth_match.group("message") if auth_match else line_str

            # Extract IP from auth log if present
            ip_match = re.search(r"from\s+(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", line_str)
            ip = ip_match.group("ip") if ip_match else "Local/Auth"

            if "failed" in line_str.lower() or "invalid user" in line_str.lower():
                failed_logins += 1
                if ip not in ip_failed_logins:
                    ip_failed_logins[ip] = []
                ip_failed_logins[ip].append({
                    "line": idx,
                    "timestamp": timestamp,
                    "method": "SSH",
                    "path": msg[:80],
                    "status": 401
                })
        else:
            malformed_count += 1

    # Synthesize Findings from Aggregated Groupings

    # 1. Brute Force Authentication Anomaly
    for ip, fails in ip_failed_logins.items():
        if len(fails) >= 3:
            anomalies.append({
                "type": "BRUTE_FORCE",
                "severity": "HIGH",
                "source_ip": ip,
                "timestamp": fails[0]["timestamp"],
                "failed_attempts": len(fails),
                "evidence": f"{len(fails)} failed authentication attempts detected from IP {ip} (e.g. line #{fails[0]['line']}: {fails[0]['method']} {fails[0]['path']} -> {fails[0]['status']})",
                "recommendation": "Enforce IP rate limiting, account lockout policies, multi-factor authentication (MFA), and automated firewall blocking."
            })

    # 2. Possible SQL Injection Indicator Anomaly
    for ip, sqli_hits in ip_sqli_attempts.items():
        anomalies.append({
            "type": "POSSIBLE_SQL_INJECTION",
            "severity": "HIGH",
            "source_ip": ip,
            "timestamp": sqli_hits[0]["timestamp"],
            "evidence": f"Detected {len(sqli_hits)} request(s) containing suspicious SQL injection syntax patterns (e.g. line #{sqli_hits[0]['line']}: signature '{sqli_hits[0]['signature']}' in path {sqli_hits[0]['path']})",
            "recommendation": "Use parameterized queries / prepared statements, sanitize all input parameters, and implement a Web Application Firewall (WAF)."
        })

    # 3. Endpoint / Directory Scanning Anomaly
    for ip, paths in ip_sensitive_paths.items():
        if len(paths) >= 2 or any(p in ["/.env", "/.git", "/config.json"] for p in paths):
            anomalies.append({
                "type": "ENDPOINT_SCANNING",
                "severity": "MEDIUM",
                "source_ip": ip,
                "timestamp": "Log Sample Window",
                "evidence": f"IP {ip} requested {len(paths)} sensitive administrative paths: {', '.join(list(paths))}",
                "recommendation": "Restrict access to sensitive administrative endpoints, disable directory listing, and block automated scanners."
            })

    # 4. HTTP 5xx Server Error Spike Anomaly
    for ip, errs in ip_server_errors.items():
        if len(errs) >= 3:
            anomalies.append({
                "type": "SERVER_ERROR_SPIKE",
                "severity": "MEDIUM",
                "source_ip": ip,
                "timestamp": errs[0]["timestamp"],
                "evidence": f"Encountered {len(errs)} HTTP 5xx server errors triggered by IP {ip} (e.g. line #{errs[0]['line']}: {errs[0]['path']} -> {errs[0]['status']})",
                "recommendation": "Inspect application error logs to fix backend exceptions and prevent unhandled crash conditions."
            })

    # 5. Request Rate Anomaly
    for ip, req_count in ip_requests.items():
        if req_count >= 25:
            anomalies.append({
                "type": "REQUEST_RATE_ANOMALY",
                "severity": "MEDIUM",
                "source_ip": ip,
                "timestamp": "Log Sample Window",
                "evidence": f"IP {ip} issued {req_count} rapid HTTP requests within the submitted log sample window.",
                "recommendation": "Apply rate limiting middleware (e.g., slowapi / Nginx limit_req) to cap excessive request rates per IP."
            })

    # Calculate Overall Threat Rating
    anomalies_count = len(anomalies)
    high_count = sum(1 for a in anomalies if a["severity"] == "HIGH")
    
    if anomalies_count == 0:
        threat_rating = "CLEAN"
    elif high_count >= 2 or (failed_logins >= 10 and high_count >= 1):
        threat_rating = "CRITICAL"
    elif high_count >= 1 or anomalies_count >= 3:
        threat_rating = "HIGH"
    elif anomalies_count >= 2:
        threat_rating = "MEDIUM"
    else:
        threat_rating = "LOW"

    return {
        "lines_processed": parsed_count,
        "malformed_lines": malformed_count,
        "failed_logins": failed_logins,
        "anomalies_detected": anomalies_count,
        "threat_rating": threat_rating,
        "anomalies": anomalies,
        "summary": f"Analyzed {parsed_count} log lines ({malformed_count} malformed). Discovered {anomalies_count} security anomalies and {failed_logins} failed login attempts."
    }
