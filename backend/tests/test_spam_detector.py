import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.spam_detector import analyze_message

def test_otp_phishing_message():
    """Test detection of OTP and credential harvesting attempt."""
    msg = "URGENT: Your Wells Fargo account is suspended. Send your 6-digit OTP verification code within 2 hours to reactivate."
    res = analyze_message(msg, source_type="SMS")

    assert res["risk_score"] >= 60
    assert res["risk_level"] in ["Medium", "High"]
    assert res["is_spam_or_scam"] is True
    assert any(i["category"] == "OTP / Credential Harvesting" for i in res["detected_indicators"])
    assert any(i["category"] == "Urgency & Fear Tactics" for i in res["detected_indicators"])

def test_fake_lottery_scam():
    """Test detection of fake lottery prize and gift scams."""
    msg = "Congratulations! You have won $1,000,000 in the international lottery. Claim your reward immediately by paying a small fee."
    res = analyze_message(msg, source_type="Email")

    assert res["risk_score"] >= 45
    assert res["is_spam_or_scam"] is True
    assert any(i["category"] == "Fake Offers & Prize Scams" for i in res["detected_indicators"])

def test_payment_and_urgency_demand():
    """Test detection of gift card or wire transfer coercion."""
    msg = "Final notice from federal tax department: Pay your overdue penalty immediately via Apple gift card or wire transfer to avoid arrest warrant."
    res = analyze_message(msg, source_type="WhatsApp")

    assert res["risk_score"] >= 50
    assert res["is_spam_or_scam"] is True
    assert any(i["category"] == "Payment & Financial Demands" for i in res["detected_indicators"])

def test_embedded_malicious_link():
    """Test message containing embedded phishing URL."""
    msg = "Your account is temporarily locked! Verify your identity at http://paypal-security-update-verification.account-confirm.net/login right now."
    res = analyze_message(msg, source_type="SMS")

    assert len(res["detected_urls"]) >= 1
    assert res["risk_score"] >= 70
    assert res["risk_level"] == "High"
    assert res["is_spam_or_scam"] is True
    assert res["detected_urls"][0]["is_phishing"] is True

def test_clean_benign_message():
    """Test normal clean message has low risk score and is not marked spam."""
    msg = "Hi Sarah, let us sync tomorrow at 10 AM to discuss the quarterly sprint roadmap. Let me know if that time works."
    res = analyze_message(msg, source_type="General")

    assert res["risk_score"] <= 10
    assert res["risk_level"] == "Low"
    assert res["is_spam_or_scam"] is False
    assert len(res["detected_indicators"]) == 0

def test_empty_message():
    """Test empty input handling."""
    res = analyze_message("")
    assert res["risk_score"] == 0
    assert res["is_spam_or_scam"] is False

def test_spam_api_endpoint():
    """Test FastAPI /api/v1/scan/spam-message endpoint with TestClient."""
    client = TestClient(app)
    payload = {
        "message": "URGENT: Verify your account immediately at http://secure-login-check.com or account will be suspended.",
        "source_type": "SMS"
    }
    response = client.post("/api/v1/scan/spam-message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data
    assert data["risk_score"] >= 40
    assert "recommendations" in data
