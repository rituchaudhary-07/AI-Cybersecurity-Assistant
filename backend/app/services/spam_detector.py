import re
from typing import Dict, Any, List, Optional
from app.services.url_scanner import analyze_url, SHORTENING_SERVICES

# Rule Patterns for Spam and Scam Detection
SPAM_RULES = {
    "otp_credentials": {
        "category": "OTP / Credential Harvesting",
        "severity": "Critical",
        "weight": 35,
        "patterns": [
            r"\b(?:share|send|enter|provide|verify|confirm|submit)\b[^\.\?!]*?\b(?:otp|passcode|code|pin|password|credentials|cvv)\b",
            r"\b(?:otp|one-time\s+password|passcode|security\s+code|verification\s+code|pin|cvv|password)\b",
            r"\b\d{1,2}-digit\s+(?:otp|code|pin|passcode)\b",
            r"\bdo\s+not\s+share\s+(?:this|your)\s+(?:code|otp|pin)\b",
            r"\bverification\s+code\s+is\s+\d{4,8}\b",
            r"\bsecret\s+recovery\s+phrase\b",
            r"\bseed\s+phrase\b",
        ],
        "description": "Requests or mentions sensitive authentication secrets (OTP, PIN, passwords, or recovery phrases)."
    },
    "urgency_threat": {
        "category": "Urgency & Fear Tactics",
        "severity": "High",
        "weight": 25,
        "patterns": [
            r"\b(?:urgent|urgently|immediately|act\s+now|action\s+required|right\s+now|asap)\b",
            r"\bwithin\s+(?:\d{1,2}\s*(?:hours?|hrs?|minutes?|mins?)|24\s*h(?:ours?)?)\b",
            r"\baccount\s+(?:is|will\s+be\s+)?(?:suspended|blocked|terminated|closed|locked|deactivated|frozen)\b",
            r"\b(?:arrest\s+warrant|legal\s+action|law\s+enforcement|police|fbi|irs|court\s+summons)\b",
            r"\bfinal\s+(?:warning|notice|reminder)\b",
            r"\bunauthorized\s+(?:access|login|transaction|charge)\b",
            r"\bfailure\s+to\s+comply\b",
        ],
        "description": "Applies psychological pressure, false deadlines, or threats of account suspension/legal action."
    },
    "fake_offers_rewards": {
        "category": "Fake Offers & Prize Scams",
        "severity": "High",
        "weight": 25,
        "patterns": [
            r"\b(?:congratulations|congrats)!?\s+(?:you(?:'ve|\s+have)?\s+(?:won|been\s+selected))\b",
            r"\b(?:lottery|jackpot|sweepstakes|lucky\s+winner|lucky\s+draw)\b",
            r"\b(?:claim|redeem)\s+(?:your\s+)?(?:prize|reward|bonus|gift\s+card|voucher|\$[\d,]+)\b",
            r"\b(?:100%|guaranteed)\s+(?:free|profit|returns?|bonus)\b",
            r"\b(?:bitcoin|crypto|eth|usdt)\s+(?:giveaway|airdrop|doubler)\b",
            r"\bunclaimed\s+(?:inheritance|funds|package|delivery)\b",
            r"\bexclusive\s+(?:deal|offer|discount\s+for\s+you)\b",
        ],
        "description": "Promises unrealistic financial windfalls, free luxury gifts, or lottery payouts to lure victims."
    },
    "payment_financial_demands": {
        "category": "Payment & Financial Demands",
        "severity": "High",
        "weight": 30,
        "patterns": [
            r"\b(?:wire\s+transfer|western\s+union|moneygram)\b",
            r"\b(?:apple|google\s+play|amazon|steam)\s+gift\s*cards?\b",
            r"\b(?:send|deposit|transfer)\s+(?:\$[\d,]+|\d+\s*crypto|\d+\s*btc)\b",
            r"\b(?:overdue|unpaid)\s+(?:tax|fee|invoice|fine|penalty)\b",
            r"\bpay\s+(?:a\s+small\s+)?(?:processing|release|customs|shipping)\s+fee\b",
            r"\b(?:cash\s*app|venmo|zelle|crypto\s+wallet)\b",
        ],
        "description": "Demands unconventional or untraceable payments (gift cards, wire transfers, crypto wallets)."
    },
    "phishing_social_engineering": {
        "category": "Phishing & Impersonation",
        "severity": "High",
        "weight": 25,
        "patterns": [
            r"\b(?:verify|validate|update|confirm)\s+(?:your\s+)?(?:account|identity|billing|profile|payment\s+method)\b",
            r"\bclick\s+(?:here|on\s+the\s+link|below)\s+to\s+(?:restore|reactivate|verify|login|claim)\b",
            r"\b(?:dear\s+customer|dear\s+user|dear\s+client|beloved)\b",
            r"\bsecurity\s+alert:\s+unusual\s+activity\b",
            r"\byour\s+(?:bank|account|wells\s+fargo|chase|citi|apple|netflix|amazon|paypal|microsoft|google)\b",
        ],
        "description": "Poses as a recognized institution instructing you to re-verify credentials or billing info."
    }
}

URL_EXTRACTOR_REGEX = re.compile(
    r'(?:https?://|www\.)[^\s<>"\'\)]+|[a-zA-Z0-9.-]+\.(?:com|org|net|io|info|xyz|top|ru|cn|buzz|club|online|site|vip|live)[^\s<>"\'\)]*',
    re.IGNORECASE
)

OBFUSCATED_PATTERNS = [
    (r"\bp[@a]ssw[o0]rd\b", "Obfuscated keyword: 'password'"),
    (r"\bb[i1!]tc[o0][i1!]n\b", "Obfuscated keyword: 'bitcoin'"),
    (r"\bw[i1!]nn[e3]r\b", "Obfuscated keyword: 'winner'"),
    (r"\bv[e3]r[i1!]fy\b", "Obfuscated keyword: 'verify'"),
]

def analyze_message(text: str, source_type: str = "General") -> Dict[str, Any]:
    """
    Lightweight, fast rule-based scam & spam detection engine.
    Detects phishing phrases, fake offers, artificial urgency, OTP requests, and payment demands.
    Extracts embedded URLs and scans them using existing lexical URL analyzer.
    Returns estimated risk score (0-100), risk level, indicators, and recommendations.
    """
    cleaned_text = (text or "").strip()
    if not cleaned_text:
        return {
            "risk_score": 0,
            "risk_level": "Safe",
            "is_spam_or_scam": False,
            "source_type": source_type,
            "detected_indicators": [],
            "categories_triggered": [],
            "detected_urls": [],
            "recommendations": ["No text provided for analysis."],
            "summary": "Empty input."
        }

    detected_indicators: List[Dict[str, Any]] = []
    categories_triggered: List[str] = []
    raw_score = 0

    lower_text = cleaned_text.lower()

    # 1. Rule Pattern Matching across Categories
    for key, rule in SPAM_RULES.items():
        category_matches = []
        for pattern in rule["patterns"]:
            matches = re.findall(pattern, lower_text, re.IGNORECASE)
            if matches:
                category_matches.extend(matches)

        if category_matches:
            # Deduplicate and limit sample matches
            unique_matches = list(set([m if isinstance(m, str) else m[0] for m in category_matches]))[:3]
            raw_score += rule["weight"]
            categories_triggered.append(rule["category"])
            detected_indicators.append({
                "category": rule["category"],
                "severity": rule["severity"],
                "description": rule["description"],
                "matched_phrases": unique_matches,
                "weight": rule["weight"]
            })

    # 2. Obfuscation & Character Disguises Check
    for obf_pattern, obf_desc in OBFUSCATED_PATTERNS:
        if re.search(obf_pattern, cleaned_text, re.IGNORECASE):
            raw_score += 15
            detected_indicators.append({
                "category": "Character Obfuscation",
                "severity": "Medium",
                "description": obf_desc,
                "matched_phrases": ["Leetspeak character substitution detected"],
                "weight": 15
            })
            if "Obfuscation" not in categories_triggered:
                categories_triggered.append("Obfuscation")

    # 3. Structural & Punctuation Anomalies
    alpha_chars = [c for c in cleaned_text if c.isalpha()]
    if len(alpha_chars) >= 20:
        uppercase_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
        if uppercase_ratio > 0.45:
            raw_score += 10
            detected_indicators.append({
                "category": "Message Formatting",
                "severity": "Low",
                "description": f"Excessive uppercase lettering ({int(uppercase_ratio * 100)}% of alphabet characters), typical of urgent spam shouting.",
                "matched_phrases": ["ALL-CAPS text style"],
                "weight": 10
            })

    excessive_punctuation = re.findall(r"[!?]{3,}", cleaned_text)
    if excessive_punctuation:
        raw_score += 10
        detected_indicators.append({
            "category": "Sensational Punctuation",
            "severity": "Low",
            "description": "Repeated exclamation or question marks used to induce emotional reaction.",
            "matched_phrases": excessive_punctuation[:2],
            "weight": 10
        })

    # 4. Embedded URL Extraction & Lexical Deep Scan
    extracted_urls = URL_EXTRACTOR_REGEX.findall(cleaned_text)
    url_scan_results: List[Dict[str, Any]] = []

    if extracted_urls:
        if "Suspicious Links" not in categories_triggered:
            categories_triggered.append("Suspicious Links")

        for u in extracted_urls[:4]:  # limit to top 4 unique links
            normalized_u = u.strip().rstrip(".,;:!?)")
            if not (normalized_u.startswith("http://") or normalized_u.startswith("https://")):
                normalized_u = "http://" + normalized_u

            url_analysis = analyze_url(normalized_u)
            url_scan_results.append({
                "raw_url": u,
                "domain": url_analysis.get("domain", ""),
                "risk_score": url_analysis.get("risk_score", 0),
                "risk_level": url_analysis.get("risk_level", "Unknown"),
                "is_phishing": url_analysis.get("is_phishing", False),
                "threat_indicators": url_analysis.get("threat_indicators", []),
                "recommendations": url_analysis.get("recommendations", [])
            })

            # Incorporate URL risk into message score
            url_risk = url_analysis.get("risk_score", 0)
            if url_risk >= 50:
                raw_score += 35
                detected_indicators.append({
                    "category": "High-Risk Embedded Link",
                    "severity": "Critical",
                    "description": f"Target link '{u}' scored high phishing probability ({url_risk}/100).",
                    "matched_phrases": [u],
                    "weight": 35
                })
            elif url_risk >= 25:
                raw_score += 15
                detected_indicators.append({
                    "category": "Suspicious Embedded Link",
                    "severity": "Medium",
                    "description": f"Target link '{u}' flagged lexical warnings (score: {url_risk}).",
                    "matched_phrases": [u],
                    "weight": 15
                })
            else:
                raw_score += 5

    # 5. Calculate Final Risk Score and Threat Classification
    risk_score = min(100, max(0, raw_score))

    if risk_score >= 70:
        risk_level = "High"
        is_spam_or_scam = True
    elif risk_score >= 35:
        risk_level = "Medium"
        is_spam_or_scam = True
    elif risk_score >= 15:
        risk_level = "Low"
        is_spam_or_scam = False
    else:
        risk_level = "Low"
        is_spam_or_scam = False

    # 6. Safety Recommendations
    recommendations = []
    if any(i["category"] == "OTP / Credential Harvesting" for i in detected_indicators):
        recommendations.append("NEVER share One-Time Passwords (OTP), PINs, or account verification codes with anyone—banks and legitimate support staff will never ask for them.")
    if any(i["category"] == "Payment & Financial Demands" for i in detected_indicators):
        recommendations.append("Refuse requests for wire transfers, crypto payments, or retail gift cards. These payment methods are irreversible and favored by scammers.")
    if any(i["category"] == "Fake Offers & Prize Scams" for i in detected_indicators):
        recommendations.append("Be skeptical of unsolicited prizes or windfalls. If you did not enter a contest, you cannot win it.")
    if any(i["category"] == "Urgency & Fear Tactics" for i in detected_indicators):
        recommendations.append("Slow down. Attackers use artificial urgency and panic to prevent you from critically verifying claims.")
    if extracted_urls:
        recommendations.append("Do NOT click links inside unexpected messages. Instead, navigate to the organization's official website directly in your browser.")
    if is_spam_or_scam:
        recommendations.append("Block the sender and report the message as spam/phishing to your carrier or email provider.")
    else:
        recommendations.append("Message appears low-risk based on standard lexical and threat phrase patterns.")
        recommendations.append("Always exercise basic caution if you receive unexpected attachments or payment requests.")

    # 7. Summary Sentence
    if risk_level == "High":
        summary = f"CRITICAL SCAM WARNING: This message displays {len(detected_indicators)} high-severity scam patterns. Strong indications of fraudulent intent."
    elif risk_level == "Medium":
        summary = f"SUSPICIOUS MESSAGE: Detected {len(detected_indicators)} warning indicators. Exercise caution before responding or interacting with links."
    elif risk_score >= 15:
        summary = "LOW THREAT: Minor promotional or formatting indicators detected, but no critical credential or payment risks."
    else:
        summary = "CLEAN MESSAGE: No common spam, phishing, or social engineering indicators found."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_spam_or_scam": is_spam_or_scam,
        "source_type": source_type,
        "message_length": len(cleaned_text),
        "detected_indicators": detected_indicators,
        "categories_triggered": categories_triggered,
        "detected_urls": url_scan_results,
        "recommendations": recommendations,
        "summary": summary
    }
