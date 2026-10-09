import io
import pytest
import qrcode
from fastapi.testclient import TestClient
from app.main import app
from app.services.qr_scanner import scan_qr_image

def _generate_qr_png_bytes(data: str) -> bytes:
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_qr_safe_url_scan():
    """Test QR code containing a safe trusted domain URL."""
    png_bytes = _generate_qr_png_bytes("https://google.com")
    result = scan_qr_image(png_bytes, filename="safe_qr.png")

    assert result["success"] is True
    assert result["is_url"] is True
    assert result["content_type"] == "url"
    assert result["auto_opened"] is False
    assert result["risk_score"] <= 10
    assert result["risk_level"] == "Safe"
    assert "url_analysis" in result
    assert result["url_analysis"]["domain"] == "google.com"

def test_qr_phishing_url_scan():
    """Test QR code containing a phishing/spoofed URL."""
    phish_url = "http://paypal-security-update-verification.account-confirm.net/login"
    png_bytes = _generate_qr_png_bytes(phish_url)
    result = scan_qr_image(png_bytes, filename="phish_qr.png")

    assert result["success"] is True
    assert result["is_url"] is True
    assert result["content_type"] == "url"
    assert result["auto_opened"] is False
    assert result["risk_score"] >= 45
    assert result["is_malicious"] is True
    assert len(result["threat_indicators"]) > 0

def test_qr_plain_text():
    """Test QR code containing safe plain text."""
    plain_text = "Conference Room 402 Keycard Notice"
    png_bytes = _generate_qr_png_bytes(plain_text)
    result = scan_qr_image(png_bytes, filename="text_qr.png")

    assert result["success"] is True
    assert result["is_url"] is False
    assert result["content_type"] == "text"
    assert result["raw_content"] == plain_text
    assert result["risk_score"] <= 10

def test_qr_wifi_credentials():
    """Test QR code containing Wi-Fi access configuration."""
    wifi_data = "WIFI:S:GuestNetwork;T:WPA;P:Pass1234;;"
    png_bytes = _generate_qr_png_bytes(wifi_data)
    result = scan_qr_image(png_bytes, filename="wifi_qr.png")

    assert result["success"] is True
    assert result["is_url"] is False
    assert result["content_type"] == "wifi"
    assert "safety_notice" in result

def test_qr_empty_bytes():
    """Test handling of empty file input."""
    result = scan_qr_image(b"")
    assert result["success"] is False
    assert "empty" in result["error"].lower()

def test_qr_corrupt_bytes():
    """Test handling of corrupt image data."""
    result = scan_qr_image(b"NOT_A_VALID_IMAGE_DATA")
    assert result["success"] is False
    assert "invalid" in result["error"].lower() or "unsupported" in result["error"].lower()

def test_qr_api_endpoint():
    """Test FastAPI /api/v1/scan/qr endpoint with TestClient."""
    client = TestClient(app)
    png_bytes = _generate_qr_png_bytes("https://wikipedia.org")

    response = client.post(
        "/api/v1/scan/qr",
        files={"file": ("wiki_qr.png", png_bytes, "image/png")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["is_url"] is True
    assert data["url_analysis"]["domain"] == "wikipedia.org"
    assert data["auto_opened"] is False
