import io
import re
from typing import Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image

from app.services.url_scanner import analyze_url

URL_REGEX = re.compile(
    r"^(?:https?://)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:/[^\s]*)?$",
    re.IGNORECASE
)

SUSPICIOUS_SCRIPT_PATTERNS = [
    r"powershell", r"cmd\.exe", r"bash\s+-i", r"curl\s+", r"wget\s+",
    r"eval\(", r"base64\s+-d", r"javascript:", r"data:text/html",
    r"<script\b", r"chmod\s+\+x", r"rm\s+-rf"
]

def _decode_with_cv2(image_np: np.ndarray) -> Optional[str]:
    """Attempt QR detection and decoding across multiple preprocessing passes."""
    detector = cv2.QRCodeDetector()

    # Pass 1: Raw image
    data, _, _ = detector.detectAndDecode(image_np)
    if data and data.strip():
        return data.strip()

    # Pass 2: Grayscale
    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np

    data, _, _ = detector.detectAndDecode(gray)
    if data and data.strip():
        return data.strip()

    # Pass 3: Otsu thresholding for high contrast
    try:
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        data, _, _ = detector.detectAndDecode(thresh)
        if data and data.strip():
            return data.strip()
    except Exception:
        pass

    # Pass 4: Inverted thresholding
    try:
        inv = cv2.bitwise_not(thresh)
        data, _, _ = detector.detectAndDecode(inv)
        if data and data.strip():
            return data.strip()
    except Exception:
        pass

    return None

def is_probable_url(text: str) -> bool:
    """Determine whether the extracted text is likely a web URL."""
    text_clean = text.strip()
    if text_clean.startswith(("http://", "https://", "ftp://")):
        return True
    if re.match(URL_REGEX, text_clean):
        return True
    return False

def scan_qr_image(file_bytes: bytes, filename: str = "upload.png") -> Dict[str, Any]:
    """
    Decodes a QR code from raw image bytes and assesses security risks.
    Extracts content without ever opening or visiting URLs.
    If a URL is detected, reuses existing analyze_url() logic.
    If plain text or other data, evaluates safety and provides security recommendations.
    """
    if not file_bytes:
        return {
            "success": False,
            "error": "The uploaded file is empty. Please upload a valid image file."
        }

    # Validate image bytes with PIL
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img.verify()
        # Re-open after verify() resets internal pointer
        pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        image_np = np.array(pil_img)
        # Convert RGB to BGR for OpenCV
        cv_img = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    except Exception as e:
        return {
            "success": False,
            "error": f"Invalid or unsupported image format. Please upload PNG, JPG, JPEG, or WEBP. ({str(e)})"
        }

    decoded_text = _decode_with_cv2(cv_img)

    if not decoded_text:
        return {
            "success": False,
            "error": "No readable QR code found in the image. Please ensure the QR code is clearly visible, well-lit, and unblurred."
        }

    raw_content = decoded_text.strip()

    # Case 1: Decoded content is a URL
    if is_probable_url(raw_content):
        # Normalize protocol if omitted
        normalized_url = raw_content
        if not (normalized_url.startswith("http://") or normalized_url.startswith("https://")):
            normalized_url = "https://" + normalized_url

        # Reuse existing URL scanner
        url_scan_result = analyze_url(normalized_url)

        return {
            "success": True,
            "filename": filename,
            "content_type": "url",
            "is_url": True,
            "raw_content": raw_content,
            "normalized_url": normalized_url,
            "auto_opened": False,
            "safety_notice": "Extracted URL detected. The URL has NOT been visited or loaded by the server or browser. Review the risk analysis below before navigating manually.",
            "url_analysis": url_scan_result,
            "risk_score": url_scan_result["risk_score"],
            "risk_level": url_scan_result["risk_level"],
            "is_malicious": url_scan_result["is_phishing"],
            "threat_indicators": [f"QR Target: {i}" for i in url_scan_result.get("threat_indicators", [])],
            "recommendations": [
                "NEVER click or open unverified URLs scanned from physical stickers, public posters, or untrusted messages.",
                *url_scan_result.get("recommendations", [])
            ]
        }

    # Case 2: Wi-Fi credentials
    if raw_content.startswith("WIFI:"):
        return {
            "success": True,
            "filename": filename,
            "content_type": "wifi",
            "is_url": False,
            "raw_content": raw_content,
            "auto_opened": False,
            "safety_notice": "QR code contains Wi-Fi access configuration. Network credentials have NOT been applied to your device.",
            "risk_score": 25,
            "risk_level": "Moderate Risk",
            "is_malicious": False,
            "threat_indicators": ["Unverified Wi-Fi Network Profile"],
            "recommendations": [
                "Avoid connecting to public or unverified Wi-Fi networks found in random QR codes.",
                "Rogue Wi-Fi access points can perform man-in-the-middle (MITM) attacks and capture unencrypted traffic.",
                "If connecting, ensure a trusted VPN is enabled."
            ]
        }

    # Case 3: Contact card (vCard / MeCard)
    if raw_content.startswith(("BEGIN:VCARD", "MECARD:")):
        return {
            "success": True,
            "filename": filename,
            "content_type": "contact",
            "is_url": False,
            "raw_content": raw_content,
            "auto_opened": False,
            "safety_notice": "QR code contains contact information (vCard). Contact has NOT been added to your address book.",
            "risk_score": 15,
            "risk_level": "Low Risk",
            "is_malicious": False,
            "threat_indicators": [],
            "recommendations": [
                "Verify the sender's identity before importing any new contacts.",
                "Inspect embedded contact fields for spoofed numbers or suspicious links."
            ]
        }

    # Case 4: Plain Text / Terminal command / Arbitrary data
    suspicious_patterns_found = []
    for pattern in SUSPICIOUS_SCRIPT_PATTERNS:
        if re.search(pattern, raw_content, re.IGNORECASE):
            suspicious_patterns_found.append(pattern)

    risk_score = 0
    threat_indicators = []
    recommendations = [
        "Extracted content is displayed safely as non-executable text.",
        "Do not copy/paste unknown commands into your system terminal or command prompt."
    ]

    if suspicious_patterns_found:
        risk_score = 75
        risk_level = "High Risk"
        is_malicious = True
        threat_indicators.append(f"Suspicious executable or script patterns: {', '.join(suspicious_patterns_found)}")
        recommendations.insert(0, "WARNING: This QR code contains potentially malicious script or shell command syntax. DO NOT execute this payload!")
    elif len(raw_content) > 1000:
        risk_score = 20
        risk_level = "Moderate Risk"
        is_malicious = False
        threat_indicators.append("Unusually large text payload")
    else:
        risk_score = 5
        risk_level = "Safe / Low Risk"
        is_malicious = False

    return {
        "success": True,
        "filename": filename,
        "content_type": "text",
        "is_url": False,
        "raw_content": raw_content,
        "auto_opened": False,
        "safety_notice": "QR code contains plain text or non-web data. It has been extracted and rendered safely as non-executable text.",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_malicious": is_malicious,
        "threat_indicators": threat_indicators,
        "recommendations": recommendations
    }
