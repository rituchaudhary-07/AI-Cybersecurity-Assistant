import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.url_scanner import (
    analyze_url,
    normalize_and_validate_url,
    calculate_entropy,
    extract_domain_parts,
    check_brand_spoofing,
    check_suspicious_redirect_parameter,
    extract_url_feature_vector,
    ML_FEATURE_NAMES,
    ScannerConfig,
    CONFIG,
    TRUSTED_DOMAINS,
    SHORTENING_SERVICES
)

client = TestClient(app)

# ==============================================================================
# 1. PRIORITY 1: NO BLIND WHITELIST BYPASS & DOMAIN BOUNDARY TESTS
# ==============================================================================

def test_whitelist_normal_url_is_safe():
    """Legitimate link on a trusted domain gets evaluated cleanly as Safe."""
    res = analyze_url("https://google.com/search?q=cybersecurity")
    assert res["is_phishing"] is False
    assert res["risk_score"] <= 1.0
    names = [f["name"] for f in res["features"]]
    assert "Trusted Global Infrastructure" in names

def test_whitelist_with_suspicious_redirect_parameter():
    """Trusted domain with open redirect parameter is not silently skipped."""
    res = analyze_url("https://google.com/url?q=https://evil-phishing-site.xyz/login")
    names = [f["name"] for f in res["features"]]
    assert "Trusted Global Infrastructure" in names
    assert "Suspicious Redirect Parameter" in names

def test_whitelist_userinfo_at_spoofing_bypasses_whitelist():
    """Userinfo @ spoofing targeting google.com connects to attacker and must be flagged."""
    res = analyze_url("http://google.com@attacker-phish-portal.xyz/login")
    assert res["is_phishing"] is True
    assert res["risk_score"] >= CONFIG.THRESHOLD_HIGH
    names = [f["name"] for f in res["features"]]
    assert "Userinfo Authority Spoofing (@)" in names

def test_at_in_path_not_treated_as_authority_spoofing():
    """An @ symbol in the URL path (e.g. Medium or GitHub user) is not authority spoofing."""
    res = analyze_url("https://github.com/@torvalds")
    assert res["is_phishing"] is False
    names = [f["name"] for f in res["features"]]
    assert "Userinfo Authority Spoofing (@)" not in names

def test_deceptive_subdomain_lookalike_not_whitelisted():
    """google.com.attacker.test is on attacker.test and must not match google.com."""
    ctx = normalize_and_validate_url("http://google.com.attacker-domain.xyz/auth")
    assert ctx.base_domain == "attacker-domain.xyz"
    res = analyze_url("http://google.com.attacker-domain.xyz/auth")
    assert res["is_phishing"] is True

# ==============================================================================
# 2. PRIORITY 2: CENTRALIZED NORMALIZATION & VALIDATION TESTS
# ==============================================================================

def test_normalize_valid_urls():
    """Verify normalization and component extraction."""
    ctx = normalize_and_validate_url("HTTPS://WWW.EXAMPLE.COM:8080/path/test?q=1#top")
    assert ctx.scheme == "https"
    assert ctx.hostname == "www.example.com"
    assert ctx.port == 8080
    assert ctx.path == "/path/test"
    assert ctx.query == "q=1"
    assert ctx.fragment == "top"

def test_normalize_bracketed_ipv6():
    """Verify bracketed IPv6 address parsing."""
    ctx = normalize_and_validate_url("http://[2001:db8::1]:8443/status")
    assert ctx.is_ip is True
    assert ctx.is_ipv6 is True
    assert ctx.hostname == "2001:db8::1"
    assert ctx.port == 8443

def test_normalize_schemeless_url():
    """Verify scheme-less URL has http:// added for parsing."""
    ctx = normalize_and_validate_url("example.com/login")
    assert ctx.scheme == "http"
    assert ctx.hostname == "example.com"

INVALID_NORMALIZATION_CASES = [
    ("", "empty"),
    ("   ", "whitespace"),
    ("111", "non-domain numeric string"),
    ("justwords", "string without domain or TLD"),
    ("http://example.com:99999", "port out of range"),
    ("http://example.com:abc", "non-numeric port"),
    ("javascript:alert(document.cookie)", "forbidden javascript:"),
    ("data:text/html;base64,PHNjcmlwdD4=", "forbidden data:"),
    ("file:///etc/shadow", "forbidden file:"),
    ("ftp://ftp.example.com", "unsupported ftp:"),
    ("http://[invalid-ipv6", "malformed ipv6"),
    ("http://example.com/\x00nullbyte", "control char"),
]

@pytest.mark.parametrize("bad_url,reason", INVALID_NORMALIZATION_CASES)
def test_normalization_rejections(bad_url, reason):
    """Invalid, forbidden, or malformed URLs must raise ValueError."""
    with pytest.raises(ValueError):
        normalize_and_validate_url(bad_url)

def test_oversized_url_rejection():
    """URL exceeding maximum length must be rejected."""
    huge_url = "https://example.com/" + ("x" * 5000)
    with pytest.raises(ValueError):
        normalize_and_validate_url(huge_url, max_length=4096)

# ==============================================================================
# 3. PRIORITY 3: REGISTRABLE DOMAIN & BRAND SPOOFING TESTS
# ==============================================================================

def test_multipart_cctld_extraction():
    """Verify public suffix extraction for multi-part ccTLDs (.co.uk, .com.au, etc.)."""
    base, sub = extract_domain_parts("portal.security.bbc.co.uk")
    assert base == "bbc.co.uk"
    assert sub == ["portal", "security"]

    base, sub = extract_domain_parts("mybank.com.au")
    assert base == "mybank.com.au"
    assert sub == []

def test_brand_spoofing_subdomain_and_base():
    """Verify brand spoofing detection across subdomains and base domains."""
    # Official brand domain -> Legitimate
    ctx = normalize_and_validate_url("https://login.paypal.com")
    is_spoof, _, _ = check_brand_spoofing(ctx)
    assert is_spoof is False

    # Brand in unauthorized base domain
    ctx = normalize_and_validate_url("http://paypal-security-update.xyz/login")
    is_spoof, brands, _ = check_brand_spoofing(ctx)
    assert is_spoof is True
    assert "paypal" in brands

    # Brand in subdomain of untrusted host
    ctx = normalize_and_validate_url("http://appleid.apple.com.verify-portal.top/auth")
    is_spoof, brands, _ = check_brand_spoofing(ctx)
    assert is_spoof is True
    assert "apple" in brands

def test_brand_homoglyph_typosquatting():
    """Verify detection of brand lookalike typos (e.g. paypa1, micros0ft)."""
    ctx = normalize_and_validate_url("http://paypa1-account.xyz/login")
    is_spoof, brands, _ = check_brand_spoofing(ctx)
    assert is_spoof is True

# ==============================================================================
# 4. PRIORITY 4: SUSPICIOUS REDIRECT PARAMETER TESTS
# ==============================================================================

def test_suspicious_redirect_parameter():
    """Verify query parameter inspection for embedded URLs."""
    ctx = normalize_and_validate_url("https://example.com/oauth/authorize?redirect_uri=https://evil.com/callback")
    has_redir, _ = check_suspicious_redirect_parameter(ctx)
    assert has_redir is True

    # Standard query parameters without URLs
    ctx = normalize_and_validate_url("https://example.com/search?q=cybersecurity&page=2")
    has_redir, _ = check_suspicious_redirect_parameter(ctx)
    assert has_redir is False

# ==============================================================================
# 5. PRIORITY 5: MACHINE LEARNING FEATURE MATRIX TESTS
# ==============================================================================

def test_ml_feature_vector_schema_and_count():
    """Verify exact 13-feature schema, types, and stability."""
    vec = extract_url_feature_vector("http://paypal-security.account-update.xyz/login?url=https://evil.com")
    assert isinstance(vec, dict)
    assert len(vec) == 13
    assert len(vec) == len(ML_FEATURE_NAMES)
    for name in ML_FEATURE_NAMES:
        assert name in vec
        assert isinstance(vec[name], float)

    # Verify repeatable deterministic output
    vec2 = extract_url_feature_vector("http://paypal-security.account-update.xyz/login?url=https://evil.com")
    assert vec == vec2

# ==============================================================================
# 6. PRIORITY 6: RISK SCORING & CLASSIFICATION TIER TESTS
# ==============================================================================

def test_risk_scoring_bounds_and_tiers():
    """Verify 0.0-10.0 score bounds and classification tiers."""
    safe_res = analyze_url("https://google.com")
    assert safe_res["risk_score"] == 0.0
    assert safe_res["risk_level"] == "Safe"
    assert safe_res["is_phishing"] is False

    threat_res = analyze_url("http://paypal-security-update.account-confirm.xyz/login")
    assert threat_res["risk_score"] >= CONFIG.THRESHOLD_CRITICAL
    assert threat_res["risk_level"] == "Critical Phishing Threat"
    assert threat_res["is_phishing"] is True

# ==============================================================================
# 7. PRIORITY 7: EVALUATION BENCHMARK & PERFORMANCE METRICS
# ==============================================================================

BENCHMARK_DATASET = [
    # 10 Legitimate Samples (Label = 0)
    {"url": "https://google.com", "label": 0},
    {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "label": 0},
    {"url": "https://github.com/fastapi/fastapi", "label": 0},
    {"url": "https://en.wikipedia.org/wiki/Computer_security", "label": 0},
    {"url": "https://apple.com/macbook-pro", "label": 0},
    {"url": "https://amazon.com/products/electronics", "label": 0},
    {"url": "https://microsoft.com/surface", "label": 0},
    {"url": "https://python.org/doc/", "label": 0},
    {"url": "https://netflix.com/title/80057281", "label": 0},
    {"url": "https://chase.com/personal/checking", "label": 0},

    # 10 Phishing Samples (Label = 1)
    {"url": "http://paypal-verification.account-update.xyz/login", "label": 1},
    {"url": "http://appleid.apple.com.verify-device.top/auth", "label": 1},
    {"url": "http://chase-online.banking-update.club/signin", "label": 1},
    {"url": "http://192.168.1.50/admin/auth.php", "label": 1},
    {"url": "http://45.33.32.156/secure/account-confirm", "label": 1},
    {"url": "http://google.com@attacker-portal.xyz/login", "label": 1},
    {"url": "http://bit.ly/paypal-secure-login", "label": 1},
    {"url": "http://tinyurl.com/banking-confirm-update", "label": 1},
    {"url": "http://a.b.c.d.e.account-verification-server.com/portal", "label": 1},
    {"url": "http://xn--pypal-4ve.com/signin", "label": 1},
]

def test_evaluation_benchmark_metrics():
    """Verify performance metrics on the standardized synthetic evaluation benchmark."""
    tp = tn = fp = fn = 0

    for sample in BENCHMARK_DATASET:
        res = analyze_url(sample["url"])
        pred = 1 if res["is_phishing"] else 0
        actual = sample["label"]

        if actual == 1 and pred == 1:
            tp += 1
        elif actual == 0 and pred == 0:
            tn += 1
        elif actual == 0 and pred == 1:
            fp += 1
        elif actual == 1 and pred == 0:
            fn += 1

    total = tp + tn + fp + fn
    accuracy = (tp + tn) / total
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall)

    assert accuracy >= 0.95
    assert precision >= 0.95
    assert recall >= 0.95
    assert f1 >= 0.95

# ==============================================================================
# 8. API INTEGRATION & SCHEMA TESTS
# ==============================================================================

def test_api_endpoint_contract():
    """Verify POST /api/v1/scan/url returns HTTP 200 with schema expected by React UI."""
    response = client.post("/api/v1/scan/url", json={"url": "https://google.com"})
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "domain" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert "is_phishing" in data
    assert "features" in data
    assert "threat_indicators" in data
    assert "recommendations" in data

def test_api_endpoint_bad_requests():
    """Verify error status codes for malformed inputs."""
    res1 = client.post("/api/v1/scan/url", json={"url": "   "})
    assert res1.status_code == 400

    res2 = client.post("/api/v1/scan/url", json={"url": "javascript:alert(1)"})
    assert res2.status_code == 400

    res3 = client.post("/api/v1/scan/url", json={"url": "http://[invalid-ipv6"})
    assert res3.status_code == 400

    res4 = client.post("/api/v1/scan/url", json={})
    assert res4.status_code == 422
