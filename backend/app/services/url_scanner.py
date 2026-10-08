import re
import math
from urllib.parse import urlparse
from typing import Dict, Any, List

# List of well-known trusted domain suffixes / whitelisted domains
TRUSTED_DOMAINS = {
    "google.com", "youtube.com", "facebook.com", "microsoft.com", "github.com",
    "wikipedia.org", "apple.com", "amazon.com", "twitter.com", "linkedin.com",
    "instagram.com", "chatgpt.com", "openai.com", "python.org", "fastapi.tiangolo.com"
}

SHORTENING_SERVICES = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "cli.gs", "pic.gd",
    "DwarfURL.com", "ow.ly", "yfrog.com", "migre.me", "ff.im", "tiny.cc"
}

def calculate_entropy(text: str) -> float:
    """Calculate Shannon Entropy of a string to detect randomized obfuscated URLs."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum(p * math.log2(p) for p in prob)

def analyze_url(url: str) -> Dict[str, Any]:
    """
    Extracts lexical features from input URL and evaluates phishing risk score.
    Returns score (0-100), risk level, feature breakdown, and security recommendations.
    """
    cleaned_url = url.strip()
    if not (cleaned_url.startswith("http://") or cleaned_url.startswith("https://")):
        cleaned_url = "http://" + cleaned_url

    parsed = urlparse(cleaned_url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    features = []
    risk_score = 0

    # 1. Check Whitelist
    is_whitelisted = False
    for td in TRUSTED_DOMAINS:
        if hostname == td or hostname.endswith("." + td):
            is_whitelisted = True
            break

    if is_whitelisted:
        return {
            "url": url,
            "domain": hostname,
            "risk_score": 5,
            "risk_level": "Safe",
            "is_phishing": False,
            "features": [
                {"name": "Trusted Domain Check", "value": "Match found in whitelist", "risk": "Low"},
                {"name": "HTTPS Protocol", "value": "Valid Scheme" if parsed.scheme == "https" else "HTTP", "risk": "Low"}
            ],
            "threat_indicators": [],
            "recommendations": [
                "Domain is recognized on the top trusted global whitelist.",
                "Verify SSL certificate integrity when entering sensitive login credentials."
            ]
        }

    # 2. URL Length
    url_length = len(cleaned_url)
    if url_length > 75:
        risk_score += 25
        features.append({"name": "URL Length", "value": f"{url_length} chars (Excessive length)", "risk": "High"})
    elif url_length > 54:
        risk_score += 15
        features.append({"name": "URL Length", "value": f"{url_length} chars (Moderately long)", "risk": "Medium"})
    else:
        features.append({"name": "URL Length", "value": f"{url_length} chars (Normal)", "risk": "Low"})

    # 3. IP Address in Hostname
    ip_pattern = r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
    if re.match(ip_pattern, hostname):
        risk_score += 35
        features.append({"name": "IP Address Host", "value": f"Raw IP detected ({hostname})", "risk": "High"})
    else:
        features.append({"name": "IP Address Host", "value": "Domain Name Used", "risk": "Low"})

    # 4. URL Shortener Service
    if hostname in SHORTENING_SERVICES:
        risk_score += 30
        features.append({"name": "Shortening Service", "value": f"Detected ({hostname})", "risk": "High"})
    else:
        features.append({"name": "Shortening Service", "value": "None", "risk": "Low"})

    # 5. @ Symbol Presence
    if "@" in cleaned_url:
        risk_score += 25
        features.append({"name": "@ Symbol Present", "value": "Found in URL structure", "risk": "High"})

    # 6. Subdomain Depth
    subdomains = hostname.split(".")
    if len(subdomains) > 3:
        risk_score += 20
        features.append({"name": "Subdomain Depth", "value": f"{len(subdomains)-2} levels deep", "risk": "Medium"})

    # 7. Prefix / Suffix Hyphens
    if "-" in hostname:
        risk_score += 15
        features.append({"name": "Hyphen in Domain", "value": "Detected hyphen character", "risk": "Medium"})

    # 8. HTTPS Scheme Check
    if parsed.scheme != "https":
        risk_score += 15
        features.append({"name": "Protocol Security", "value": "Unencrypted HTTP Scheme", "risk": "Medium"})

    # 9. Suspicious Keywords
    suspicious_keywords = ["login", "verify", "update", "account", "banking", "secure", "confirm", "signin", "paypal"]
    found_keywords = [kw for kw in suspicious_keywords if kw in cleaned_url.lower()]
    if found_keywords:
        risk_score += 20
        features.append({"name": "Social Engineering Keywords", "value": f"Keywords found: {', '.join(found_keywords)}", "risk": "High"})

    # 10. Shannon Entropy
    entropy = calculate_entropy(cleaned_url)
    if entropy > 4.5:
        risk_score += 15
        features.append({"name": "URL Shannon Entropy", "value": f"{entropy:.2f} (High randomness)", "risk": "Medium"})

    # Bound risk score between 0 and 100
    risk_score = min(100, risk_score)

    if risk_score >= 70:
        risk_level = "Critical Phishing Threat"
        is_phishing = True
    elif risk_score >= 45:
        risk_level = "High Risk"
        is_phishing = True
    elif risk_score >= 25:
        risk_level = "Moderate Risk"
        is_phishing = False
    else:
        risk_level = "Safe / Low Risk"
        is_phishing = False

    threat_indicators = [f["name"] for f in features if f.get("risk") in ["High", "Medium"]]

    recommendations = []
    if is_phishing:
        recommendations.append("DO NOT enter sensitive passwords, credentials, or credit card details on this link.")
        recommendations.append("Verify the official website URL directly via a search engine or official bookmark.")
        recommendations.append("Check for spoofed brand names or misspellings in the domain name.")
    else:
        recommendations.append("URL demonstrates standard lexical patterns.")
        recommendations.append("Ensure HTTPS SSL lock icon is present in your browser address bar.")

    return {
        "url": url,
        "domain": hostname,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_phishing": is_phishing,
        "features": features,
        "threat_indicators": threat_indicators,
        "recommendations": recommendations
    }
