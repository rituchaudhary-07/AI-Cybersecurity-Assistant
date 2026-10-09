import sys
sys.path.insert(0, '.')
from app.services.log_analyzer import analyze_log_content

sample = """# Sample Website Security Log
# Purpose: Test data for a website suspicious-activity log analyzer.
# All IP addresses, usernames, paths, and events below are fictional examples.
# Format: timestamp | source_ip | method | path | status | user_agent | event

2026-10-09T08:14:02Z | 203.0.113.45 | GET | / | 200 | Mozilla/5.0 Chrome/128 | normal_page_visit
2026-10-09T08:14:11Z | 203.0.113.45 | GET | /products | 200 | Mozilla/5.0 Chrome/128 | normal_page_visit
2026-10-09T08:16:30Z | 198.51.100.27 | GET | /login | 200 | Mozilla/5.0 Firefox/130 | login_page_visit
2026-10-09T08:16:33Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=admin
2026-10-09T08:16:35Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=admin
2026-10-09T08:16:37Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=administrator
2026-10-09T08:16:39Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=root
2026-10-09T08:16:41Z | 198.51.100.27 | POST | /login | 429 | python-requests/2.32 | rate_limit_triggered repeated_login_failures
2026-10-09T08:20:08Z | 192.0.2.88 | GET | /wp-admin | 404 | curl/8.4.0 | probe_common_admin_path
2026-10-09T08:20:10Z | 192.0.2.88 | GET | /.env | 404 | curl/8.4.0 | probe_sensitive_file
2026-10-09T08:20:12Z | 192.0.2.88 | GET | /phpmyadmin | 404 | curl/8.4.0 | probe_database_admin
2026-10-09T08:20:14Z | 192.0.2.88 | GET | /backup.zip | 404 | curl/8.4.0 | probe_backup_file
2026-10-09T08:24:51Z | 198.51.100.91 | GET | /search?q=%27%20OR%201%3D1-- | 400 | Mozilla/5.0 Chrome/128 | possible_sql_injection_probe
2026-10-09T08:24:55Z | 198.51.100.91 | GET | /product?id=1%20UNION%20SELECT | 403 | Mozilla/5.0 Chrome/128 | possible_sql_injection_probe
2026-10-09T08:28:19Z | 203.0.113.77 | GET | /page?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E | 403 | Mozilla/5.0 Chrome/128 | possible_xss_probe
2026-10-09T08:31:44Z | 192.0.2.142 | GET | /api/users | 200 | Go-http-client/1.1 | unusual_api_request
2026-10-09T08:31:46Z | 192.0.2.142 | GET | /api/users?page=2 | 200 | Go-http-client/1.1 | rapid_api_enumeration
2026-10-09T08:31:47Z | 192.0.2.142 | GET | /api/users?page=3 | 200 | Go-http-client/1.1 | rapid_api_enumeration
2026-10-09T08:31:48Z | 192.0.2.142 | GET | /api/users?page=4 | 429 | Go-http-client/1.1 | rate_limit_triggered_api_requests
2026-10-09T08:36:02Z | 203.0.113.45 | GET | /account | 200 | Mozilla/5.0 Chrome/128 | normal_page_visit
2026-10-09T08:36:18Z | 203.0.113.45 | POST | /logout | 302 | Mozilla/5.0 Chrome/128 | normal_logout
2026-10-09T08:41:09Z | 198.51.100.203 | GET | /../../etc/passwd | 400 | scan-tool/1.0 | possible_path_traversal_probe
2026-10-09T08:44:26Z | 198.51.100.203 | POST | /upload | 413 | scan-tool/1.0 | oversized_upload_rejected
2026-10-09T08:48:53Z | 192.0.2.201 | GET | /login | 200 | Mozilla/5.0 Chrome/128 | login_page_visit
2026-10-09T08:49:01Z | 192.0.2.201 | POST | /login | 200 | Mozilla/5.0 Chrome/128 | successful_login username=test_user
2026-10-09T08:52:40Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=admin
2026-10-09T08:52:42Z | 198.51.100.27 | POST | /login | 401 | python-requests/2.32 | failed_login username=admin
2026-10-09T08:52:44Z | 198.51.100.27 | POST | /login | 429 | python-requests/2.32 | rate_limit_triggered repeated_login_failures"""

r = analyze_log_content(sample)
print(f"lines_processed: {r['lines_processed']}")
print(f"malformed_lines: {r['malformed_lines']}")
print(f"failed_logins:   {r['failed_logins']}")
print(f"anomalies:       {r['anomalies_detected']}")
print(f"threat_rating:   {r['threat_rating']}")
print()
for a in r['anomalies']:
    print(f"  [{a['severity']}] {a['type']} | IP: {a['source_ip']}")
