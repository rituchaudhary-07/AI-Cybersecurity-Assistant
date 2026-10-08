import os
import pytest
from app.services.log_analyzer import analyze_log_content

def test_normal_http_traffic():
    """Test normal clean HTTP access log traffic."""
    log_text = """192.168.1.50 - - [06/Oct/2026:10:15:00 +0000] "GET /index.html HTTP/1.1" 200 4520
192.168.1.50 - - [06/Oct/2026:10:15:05 +0000] "GET /about.html HTTP/1.1" 200 1200"""
    res = analyze_log_content(log_text)
    assert res["lines_processed"] == 2
    assert res["anomalies_detected"] == 0
    assert res["failed_logins"] == 0
    assert res["threat_rating"] == "CLEAN"

def test_repeated_401_brute_force():
    """Test repeated 401 login attempts flag BRUTE_FORCE anomaly."""
    log_text = """203.0.113.45 - - [06/Oct/2026:10:15:20 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:21 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:22 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:23 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:24 +0000] "POST /login HTTP/1.1" 401 230"""
    res = analyze_log_content(log_text)
    assert res["failed_logins"] == 5
    assert res["anomalies_detected"] >= 1
    assert any(a["type"] == "BRUTE_FORCE" for a in res["anomalies"])
    assert res["threat_rating"] in ["HIGH", "CRITICAL"]

def test_sql_injection_indicators():
    """Test SQL injection pattern detection in URL parameters."""
    log_text = """198.51.100.88 - - [06/Oct/2026:10:16:01 +0000] "GET /products.php?id=1%27%20OR%201=1-- HTTP/1.1" 500 1200"""
    res = analyze_log_content(log_text)
    assert res["anomalies_detected"] >= 1
    assert any(a["type"] == "POSSIBLE_SQL_INJECTION" for a in res["anomalies"])

def test_endpoint_scanning():
    """Test sensitive endpoint directory probing detection."""
    log_text = """198.51.100.88 - - [06/Oct/2026:10:16:05 +0000] "GET /.env HTTP/1.1" 404 180
198.51.100.88 - - [06/Oct/2026:10:16:07 +0000] "GET /admin/config.json HTTP/1.1" 403 210"""
    res = analyze_log_content(log_text)
    assert res["anomalies_detected"] >= 1
    assert any(a["type"] == "ENDPOINT_SCANNING" for a in res["anomalies"])

def test_repeated_500_errors():
    """Test HTTP 5xx error spike detection."""
    log_text = """192.168.1.50 - - [06/Oct/2026:10:17:10 +0000] "GET /api/users HTTP/1.1" 500 450
192.168.1.50 - - [06/Oct/2026:10:17:11 +0000] "GET /api/users HTTP/1.1" 500 450
192.168.1.50 - - [06/Oct/2026:10:17:12 +0000] "GET /api/users HTTP/1.1" 500 450"""
    res = analyze_log_content(log_text)
    assert res["anomalies_detected"] >= 1
    assert any(a["type"] == "SERVER_ERROR_SPIKE" for a in res["anomalies"])

def test_malformed_log_lines():
    """Test tracking of malformed lines without crashing."""
    log_text = """192.168.1.50 - - [06/Oct/2026:10:15:00 +0000] "GET /index.html HTTP/1.1" 200 4520
INVALID_UNPARSABLE_LOG_LINE
ANOTHER_RANDOM_TEXT_LINE"""
    res = analyze_log_content(log_text)
    assert res["lines_processed"] == 1
    assert res["malformed_lines"] == 2

def test_sample_log_dataset_file():
    """Test parsing safe local sample log file dataset."""
    sample_file_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_web_access.log")
    assert os.path.exists(sample_file_path)

    with open(sample_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    res = analyze_log_content(content)
    assert res["lines_processed"] > 0
    assert res["failed_logins"] >= 5
    assert res["anomalies_detected"] >= 3
    assert res["threat_rating"] in ["HIGH", "CRITICAL"]
