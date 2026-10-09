import re
import json
import urllib.parse
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest

# Helpers for dual-decode (percent-encoded + form-encoded +)
def _decode_path(path: str) -> str:
    """Decode URL-encoded path using both unquote_plus (+ -> space) and unquote."""
    try:
        return urllib.parse.unquote_plus(path)
    except Exception:
        return urllib.parse.unquote(path)

# Regex Patterns for log line parsing
# 1. Combined / Common Log Format: IP - - [Timestamp] "METHOD PATH PROTOCOL" STATUS SIZE
WEB_LOG_PATTERN = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+\S+\s+\[(?P<time>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)(?:\s+(?P<protocol>\S+))?"\s+(?P<status>\d{3})\s+(?P<size>\S+)'
)

# 2. Syslog / Auth Log Format: Month Day Time Host Process: Message
AUTH_LOG_PATTERN = re.compile(
    r'^(?P<time>[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(?P<host>\S+)\s+(?P<process>[^:]+):\s+(?P<message>.+)'
)

# 3. Nginx / Apache Error Log Format: 2026/10/06 10:15:20 [error] ... client: IP, ... request: "METHOD PATH"
ERROR_LOG_PATTERN = re.compile(
    r'^(?P<time>\d{4}[/-]\d{2}[/-]\d{2}\s+\d{2}:\d{2}:\d{2}|\w{3}\s+\d+\s+[\d:]+).*?\[(?P<level>\w+)\].*?(?:client:\s*(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))?.*?(?:request:\s*"(?P<method>\w+)\s+(?P<path>[^"\s]+))?',
    re.IGNORECASE
)

# 4. Generic Web Log / Simplified Access Line: IP ... METHOD /path ... STATUS
GENERIC_WEB_PATTERN = re.compile(
    r'(?P<ip>\b(?:\d{1,3}\.){3}\d{1,3}\b).*?(?:\[(?P<time>[^\]]+)\])?.*?"?(?P<method>GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(?P<path>/[^\s"]*).*?\b(?P<status>[1-5]\d{2})\b',
    re.IGNORECASE
)

# Sensitive Administrative Endpoints for Directory Scanning Detection
SENSITIVE_ENDPOINTS = [
    "/admin", "/wp-admin", "/phpmyadmin", "/server-status",
    "/.env", "/.git", "/config.json", "/db.sql", "/backup.zip",
    "/etc/passwd", "/api/v1/admin", "/wp-login.php",
    "/actuator", "/swagger.json", "/.aws/credentials", "/web.config"
]

# SQL Injection Signature Indicators
SQLI_SIGNATURES = [
    # Classic SQLi payloads
    "union select", "union all select", "select * from", "drop table",
    "insert into", "delete from", "update set",
    # Auth bypass
    "or 1=1", "or '1'='1", "' or '", "' or ''='", "or 1=1--", "1=1--",
    "or true--", "' or 1--", "admin'--",
    # XSS indicators in URL
    "<script>", "alert(", "onerror=", "onload=", "javascript:",
    # Path traversal
    "../", "..%2f", "..%5c",
    # Sensitive file access via path
    "/etc/passwd", "/etc/shadow", "/proc/self",
    # Time-based blind SQLi
    "waitfor delay", "sleep(", "benchmark(", "pg_sleep(",
    # Comment / terminator sequences
    "/*", "*/", "xp_cmdshell",
    # Encoded variants (raw)
    "%27%20or%20", "%27or%27",
    # Schema enumeration
    "information_schema", "sys.tables", "sysobjects",
    # Stored procedure / exec
    "exec(", "execute(", "sp_executesql"
]

def _parse_single_line(line_str: str) -> Optional[Dict[str, Any]]:
    """Attempts multi-strategy parsing for standard, JSON, syslog, and error log formats."""
    # Check JSON formatted log line
    if line_str.startswith("{") and line_str.endswith("}"):
        try:
            data = json.loads(line_str)
            ip = str(data.get("ip") or data.get("client_ip") or data.get("remote_addr") or "127.0.0.1")
            status = int(data.get("status") or data.get("status_code") or 200)
            path = str(data.get("path") or data.get("url") or data.get("uri") or "/")
            method = str(data.get("method") or "GET").upper()
            timestamp = str(data.get("time") or data.get("timestamp") or "JSON")
            return {
                "type": "web",
                "ip": ip,
                "status": status,
                "path": path,
                "method": method,
                "timestamp": timestamp
            }
        except Exception:
            pass

    # Strategy 1: Combined / Common Web Log Pattern
    m = WEB_LOG_PATTERN.match(line_str)
    if m:
        return {
            "type": "web",
            "ip": m.group("ip"),
            "status": int(m.group("status")),
            "path": m.group("path"),
            "method": m.group("method"),
            "timestamp": m.group("time")
        }

    # Strategy 2: Syslog / SSH Authentication Log
    m_auth = AUTH_LOG_PATTERN.match(line_str)
    if m_auth or "failed password" in line_str.lower() or "authentication failure" in line_str.lower() or "invalid user" in line_str.lower():
        timestamp = m_auth.group("time") if m_auth else "Syslog"
        msg = m_auth.group("message") if m_auth else line_str
        ip_match = re.search(r"from\s+(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", line_str)
        ip = ip_match.group("ip") if ip_match else "Local/Auth"
        is_failure = any(w in line_str.lower() for w in ["failed", "invalid user", "failure", "error"])
        return {
            "type": "auth",
            "ip": ip,
            "status": 401 if is_failure else 200,
            "path": msg[:80],
            "method": "SSH",
            "timestamp": timestamp,
            "is_failure": is_failure
        }

    # Strategy 3: Nginx / Apache Error Log
    m_err = ERROR_LOG_PATTERN.match(line_str)
    if m_err and m_err.group("path"):
        return {
            "type": "web",
            "ip": m_err.group("ip") or "127.0.0.1",
            "status": 500,
            "path": m_err.group("path") or "/",
            "method": m_err.group("method") or "GET",
            "timestamp": m_err.group("time") or "ErrorLog"
        }

    # Strategy 4: Generic Web Log Match
    m_gen = GENERIC_WEB_PATTERN.search(line_str)
    if m_gen:
        return {
            "type": "web",
            "ip": m_gen.group("ip"),
            "status": int(m_gen.group("status")),
            "path": m_gen.group("path"),
            "method": m_gen.group("method").upper(),
            "timestamp": m_gen.group("time") or "AccessLog"
        }

    return None

def analyze_log_content(content_str: str) -> Dict[str, Any]:
    """
    Parses web access and auth log files and performs multi-layer anomaly detection:
    - Failed login brute force tracking
    - SQL injection indicators
    - Sensitive endpoint / directory scanning
    - HTTP 5xx error spikes
    - Request rate anomalies
    - Scikit-Learn Isolation Forest unsupervised outlier detection
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

        parsed = _parse_single_line(line_str)

        if not parsed:
            malformed_count += 1
            continue

        parsed_count += 1
        ip = parsed["ip"]
        status = parsed["status"]
        path = parsed["path"]
        method = parsed["method"]
        timestamp = parsed["timestamp"]

        ip_requests[ip] = ip_requests.get(ip, 0) + 1
        # Decode both percent-encoding (%XX) and form encoding (+ -> space)
        decoded_path = _decode_path(path)
        # Also keep raw path for signatures that use % hex encoding themselves
        raw_path = path

        if parsed["type"] == "auth":
            if parsed.get("is_failure", False) or status == 401:
                failed_logins += 1
                if ip not in ip_failed_logins:
                    ip_failed_logins[ip] = []
                ip_failed_logins[ip].append({
                    "line": idx,
                    "timestamp": timestamp,
                    "method": "SSH",
                    "path": path,
                    "status": 401
                })
        else:
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
            # Check against decoded path (unquote_plus handles + as space)
            # AND against the raw path for hex-encoded patterns like %27or%27
            path_lower = decoded_path.lower()
            raw_lower = raw_path.lower()
            for sig in SQLI_SIGNATURES:
                if sig in path_lower or sig in raw_lower:
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
            # Check decoded (handles %2e%2e etc.) and also raw path
            path_lower_for_ep = decoded_path.lower()
            for sens in SENSITIVE_ENDPOINTS:
                if sens in path_lower_for_ep or sens in raw_path.lower():
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
        elif len(fails) >= 2 and any(f.get("method") == "SSH" for f in fails):
            anomalies.append({
                "type": "SSH_BRUTE_FORCE",
                "severity": "HIGH",
                "source_ip": ip,
                "timestamp": fails[0]["timestamp"],
                "failed_attempts": len(fails),
                "evidence": f"{len(fails)} failed SSH authentication attempts detected from IP {ip}",
                "recommendation": "Disable root SSH login, change default SSH port, and enforce SSH public key authentication."
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
    # Critical single endpoints (data exfiltration risk) always trigger even alone
    CRITICAL_SINGLE_ENDPOINTS = {"/.env", "/.git", "/config.json", "/db.sql",
                                  "/backup.zip", "/.aws/credentials", "/web.config", "/etc/passwd"}
    for ip, paths in ip_sensitive_paths.items():
        has_critical = any(p in CRITICAL_SINGLE_ENDPOINTS for p in paths)
        if len(paths) >= 2 or has_critical:
            severity = "HIGH" if has_critical else "MEDIUM"
            anomalies.append({
                "type": "ENDPOINT_SCANNING",
                "severity": severity,
                "source_ip": ip,
                "timestamp": "Log Sample Window",
                "evidence": f"IP {ip} requested {len(paths)} sensitive administrative path(s): {', '.join(sorted(paths))}",
                "recommendation": "Restrict access to sensitive administrative endpoints, disable directory listing, and block automated scanners via WAF rules."
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

    # 6. Unsupervised Machine Learning: Isolation Forest Outlier Detection
    ml_anomalies_count = 0
    unique_ips = list(ip_requests.keys())
    if len(unique_ips) >= 4:
        try:
            # Feature matrix: [request_count, failed_logins, 5xx_errors, sensitive_endpoints, sqli_hits]
            feature_rows = []
            for ip in unique_ips:
                feature_rows.append([
                    float(ip_requests.get(ip, 0)),
                    float(len(ip_failed_logins.get(ip, []))),
                    float(len(ip_server_errors.get(ip, []))),
                    float(len(ip_sensitive_paths.get(ip, []))),
                    float(len(ip_sqli_attempts.get(ip, [])))
                ])
            X = np.array(feature_rows)
            # Only fit if variance exists
            if np.any(np.std(X, axis=0) > 0):
                iso_forest = IsolationForest(contamination=0.25, random_state=42)
                preds = iso_forest.fit_predict(X)
                for idx_ip, pred in enumerate(preds):
                    if pred == -1:  # Outlier
                        outlier_ip = unique_ips[idx_ip]
                        # Only add if not already marked as BRUTE_FORCE or SQLI to prevent noise
                        existing_types = [a["type"] for a in anomalies if a.get("source_ip") == outlier_ip]
                        if not any(t in ["BRUTE_FORCE", "POSSIBLE_SQL_INJECTION"] for t in existing_types):
                            ml_anomalies_count += 1
                            anomalies.append({
                                "type": "ISOLATION_FOREST_OUTLIER",
                                "severity": "HIGH",
                                "source_ip": outlier_ip,
                                "timestamp": "Log Sample Window",
                                "evidence": f"Unsupervised Isolation Forest ML model identified IP {outlier_ip} as a multi-dimensional statistical behavioral outlier (Requests: {int(X[idx_ip][0])}, Failures: {int(X[idx_ip][1])}, Errors: {int(X[idx_ip][2])}).",
                                "recommendation": "Quarantine IP address and review application session telemetry for novel zero-day exploration techniques."
                            })
        except Exception:
            pass

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
        "ml_anomalies_detected": ml_anomalies_count,
        "ml_engine": "Isolation Forest (scikit-learn)",
        "threat_rating": threat_rating,
        "anomalies": anomalies,
        "summary": f"Analyzed {parsed_count} log lines ({malformed_count} malformed). Discovered {anomalies_count} security anomalies and {failed_logins} failed login attempts."
    }
