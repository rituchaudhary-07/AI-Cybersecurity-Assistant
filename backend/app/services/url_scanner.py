import re
import math
import ipaddress
from collections import Counter
from urllib.parse import urlparse, parse_qs, unquote
from dataclasses import dataclass, field
from typing import Dict, Any, List, Set, Optional, Tuple

# ==============================================================================
# 1. CENTRALIZED CONFIGURATION & SCORING PARAMETERS
# ==============================================================================

@dataclass(frozen=True)
class ScannerConfig:
    """Configurable scoring weights, thresholds, and boundary constraints."""
    MAX_URL_LENGTH: int = 4096

    # Heuristic Threat Weights (0.0 - 10.0 scale)
    WEIGHT_IP_HOST: float = 3.5
    WEIGHT_BRAND_SPOOFING: float = 3.0
    WEIGHT_SHORTENING_SERVICE: float = 3.0
    WEIGHT_USERINFO_AT: float = 2.5
    WEIGHT_PUNYCODE_IDN: float = 2.5
    WEIGHT_OPEN_REDIRECT_PARAM: float = 2.0
    WEIGHT_SUSPICIOUS_TLD: float = 2.0
    WEIGHT_EXCESSIVE_SUBDOMAINS: float = 2.0
    WEIGHT_SOCIAL_ENG_KEYWORDS: float = 2.0
    WEIGHT_HIGH_ENTROPY: float = 1.5
    WEIGHT_MULTIPLE_HYPHENS: float = 1.5
    WEIGHT_SINGLE_HYPHEN: float = 0.5
    WEIGHT_EXCESSIVE_LENGTH: float = 1.5
    WEIGHT_MODERATE_LENGTH: float = 0.8
    WEIGHT_UNENCRYPTED_HTTP: float = 1.0

    # Whitelist risk mitigation credit
    CREDIT_TRUSTED_DOMAIN: float = -3.5

    # Classification Thresholds
    THRESHOLD_CRITICAL: float = 7.0
    THRESHOLD_HIGH: float = 4.5
    THRESHOLD_MODERATE: float = 2.5

    # Entropy cutoff
    ENTROPY_SUSPICIOUS_THRESHOLD: float = 4.6

CONFIG = ScannerConfig()

# ==============================================================================
# 2. THREAT INTELLIGENCE & KNOWLEDGE BASES
# ==============================================================================

# Verified global trusted registrable base domains
TRUSTED_DOMAINS: Set[str] = {
    "google.com", "youtube.com", "facebook.com", "microsoft.com", "github.com",
    "wikipedia.org", "apple.com", "amazon.com", "twitter.com", "linkedin.com",
    "instagram.com", "chatgpt.com", "openai.com", "python.org", "fastapi.tiangolo.com",
    "netflix.com", "paypal.com", "chase.com", "bankofamerica.com", "cloudflare.com",
    "dropbox.com", "adobe.com", "binance.com", "coinbase.com", "wellsfargo.com"
}

# Verified official brand -> official registrable domains map
OFFICIAL_BRAND_DOMAINS: Dict[str, Set[str]] = {
    "paypal": {"paypal.com", "paypal-community.com"},
    "apple": {"apple.com", "icloud.com"},
    "google": {"google.com", "youtube.com", "gmail.com", "googleblog.com"},
    "microsoft": {"microsoft.com", "office.com", "live.com", "azure.com"},
    "amazon": {"amazon.com", "aws.amazon.com", "media-amazon.com"},
    "netflix": {"netflix.com"},
    "facebook": {"facebook.com", "fb.com", "meta.com"},
    "instagram": {"instagram.com"},
    "chase": {"chase.com", "jpmorganchase.com"},
    "wellsfargo": {"wellsfargo.com"},
    "bankofamerica": {"bankofamerica.com", "bofa.com"},
    "binance": {"binance.com"},
    "coinbase": {"coinbase.com"},
    "twitter": {"twitter.com", "x.com"},
    "dropbox": {"dropbox.com"},
    "adobe": {"adobe.com"}
}

# Common typos/homoglyphs for target brands (e.g. 1 for l, 0 for o)
BRAND_HOMOGLYPH_PATTERNS: Dict[str, str] = {
    "paypal": r"p[a@4]yp[a@4][l1|]|paypa[l1|]|pa1pal|paypaI",
    "google": r"g[o0]{2}g[l1|]e|g00g[l1|]e|googIe",
    "apple": r"[a@4]pp[l1|]e|appIe",
    "microsoft": r"micr[o0]s[o0]ft|rnicrosoft|micros0ft",
    "amazon": r"[a@4]m[a@4]z[o0]n|amaz0n",
    "netflix": r"netf[l1|]ix|netfIix",
    "chase": r"ch[a@4]se|chas3",
    "binance": r"bin[a@4]nce|b1nance",
    "coinbase": r"c[o0]inb[a@4]se|c0inbase"
}

# Known URL shortener services
SHORTENING_SERVICES: Set[str] = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "cli.gs", "pic.gd",
    "dwarfourl.com", "ow.ly", "yfrog.com", "migre.me", "ff.im", "tiny.cc",
    "buff.ly", "rebrand.ly", "cutt.ly", "qr.ae", "v.gd", "shorturl.at"
}

# High-abuse TLDs commonly seen in disposable phishing campaigns
SUSPICIOUS_TLDS: Set[str] = {
    ".xyz", ".top", ".buzz", ".club", ".work", ".gq", ".ml", ".cf", ".ga", ".tk",
    ".loan", ".click", ".country", ".stream", ".download", ".racing", ".accountant",
    ".vip", ".fit", ".rest", ".monster", ".cam", ".sbs"
}

# Dangerous pseudo-schemes
FORBIDDEN_SCHEMES: Tuple[str, ...] = ("javascript:", "data:", "file:", "vbscript:", "blob:", "about:")

# Query parameter names frequently abused in open redirect and OAuth lure links
REDIRECT_QUERY_PARAMS: Set[str] = {
    "url", "redirect", "redirect_uri", "redirect_url", "next", "dest", "destination",
    "return_to", "return_url", "target", "link", "r", "u", "q", "uri", "out",
    "continue", "relay", "forward", "goto", "callback", "fallback"
}

# High-risk social engineering terminology
SOCIAL_ENG_KEYWORDS: Set[str] = {
    "login", "verify", "update", "account", "banking", "secure", "confirm", "signin",
    "password", "credential", "auth", "validation", "wallet", "recovery", "billing",
    "security-alert", "passcode", "identity", "unusual-activity"
}

# Multi-part ccTLD suffixes for accurate public suffix extraction
KNOWN_TWO_PART_CCTLDS: Set[str] = {
    "co.uk", "org.uk", "gov.uk", "ac.uk", "net.uk",
    "com.au", "net.au", "org.au", "edu.au", "gov.au",
    "co.nz", "net.nz", "org.nz",
    "co.jp", "ne.jp", "ac.jp", "go.jp",
    "com.br", "net.br", "org.br",
    "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "nic.in",
    "com.sg", "net.sg", "org.sg", "edu.sg",
    "com.my", "net.my", "org.my", "edu.my",
    "com.hk", "net.hk", "org.hk", "edu.hk",
    "co.za", "net.za", "org.za"
}

# ==============================================================================
# 3. CENTRALIZED URL NORMALIZATION & PARSING PIPELINE
# ==============================================================================

@dataclass
class ParsedURLContext:
    """Standardized representation of a validated, normalized URL."""
    raw_url: str
    normalized_url: str
    scheme: str
    authority: str
    userinfo: str
    has_userinfo_at: bool
    hostname: str
    port: Optional[int]
    path: str
    query: str
    fragment: str
    base_domain: str
    subdomains: List[str]
    is_ip: bool
    is_ipv4: bool
    is_ipv6: bool
    is_private_or_loopback: bool

def calculate_entropy(text: str) -> float:
    """
    Calculate Shannon Entropy of a string in linear O(N) time.
    H(X) = -sum(P(x) * log2(P(x)))
    """
    if not text:
        return 0.0
    length = len(text)
    counts = Counter(text)
    return -sum((cnt / length) * math.log2(cnt / length) for cnt in counts.values())

def extract_domain_parts(hostname: str) -> Tuple[str, List[str]]:
    """
    Extracts base registrable domain and subdomains using multi-part ccTLD awareness.
    Returns (base_domain, subdomains_list).
    """
    clean_host = hostname.lower().strip(".")
    if not clean_host:
        return "", []

    try:
        ipaddress.ip_address(clean_host.strip("[]"))
        return clean_host, []
    except ValueError:
        pass

    parts = clean_host.split(".")
    if len(parts) <= 2:
        return clean_host, []

    last_two = ".".join(parts[-2:])
    if last_two in KNOWN_TWO_PART_CCTLDS and len(parts) >= 3:
        base_domain = ".".join(parts[-3:])
        subdomains = parts[:-3]
    else:
        base_domain = ".".join(parts[-2:])
        subdomains = parts[:-2]

    return base_domain, subdomains

def normalize_and_validate_url(raw_url: str, max_length: int = CONFIG.MAX_URL_LENGTH) -> ParsedURLContext:
    """
    Single unified entry point for strict URL normalization and validation.
    Used identically by both analyze_url() and extract_url_feature_vector().
    """
    if not isinstance(raw_url, str):
        raise ValueError("URL must be a string.")

    cleaned = raw_url.strip()
    if not cleaned:
        raise ValueError("URL string cannot be empty or whitespace.")

    # Control characters check
    if any(ord(c) < 32 or ord(c) == 127 for c in cleaned):
        raise ValueError("URL contains invalid ASCII control characters.")

    if len(cleaned) > max_length:
        raise ValueError(f"URL exceeds maximum allowed length of {max_length} characters.")

    # Check for forbidden dangerous pseudo-schemes
    lower_raw = cleaned.lower()
    for scheme in FORBIDDEN_SCHEMES:
        if lower_raw.startswith(scheme):
            raise ValueError(f"Unsupported or dangerous URL scheme: '{scheme}'")

    # Protocol normalization
    if lower_raw.startswith("http://") or lower_raw.startswith("https://"):
        url_to_parse = cleaned
    else:
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", cleaned):
            raise ValueError("Only HTTP and HTTPS protocols are supported.")
        url_to_parse = "http://" + cleaned

    try:
        parsed = urlparse(url_to_parse)
    except Exception as e:
        raise ValueError(f"Malformed URL structure: {str(e)}")

    scheme = parsed.scheme.lower() if parsed.scheme else "http"
    if scheme not in ("http", "https"):
        raise ValueError(f"Unsupported URL protocol scheme: '{scheme}'")

    netloc = parsed.netloc or ""
    if not netloc:
        raise ValueError("URL does not contain a valid network location / authority.")

    userinfo = ""
    has_userinfo_at = False
    host_port = netloc

    if "@" in netloc:
        has_userinfo_at = True
        userinfo, host_port = netloc.split("@", 1)

    hostname_raw = ""
    port: Optional[int] = None

    try:
        hostname_raw = (parsed.hostname or "").lower()
        if parsed.port is not None:
            port = parsed.port
    except ValueError as pe:
        raise ValueError(f"Invalid authority structure or port: {str(pe)}")

    if not hostname_raw:
        if host_port.startswith("[") and "]" in host_port:
            hostname_raw = host_port[1:host_port.index("]")].lower()
        else:
            hostname_raw = host_port.split(":")[0].lower()

    if not hostname_raw:
        raise ValueError("URL does not contain a valid hostname.")

    is_ip = False
    is_ipv4 = False
    is_ipv6 = False
    is_private_or_loopback = False

    clean_ip_host = hostname_raw.strip("[]")
    try:
        ip_obj = ipaddress.ip_address(clean_ip_host)
        is_ip = True
        is_ipv4 = (ip_obj.version == 4)
        is_ipv6 = (ip_obj.version == 6)
        is_private_or_loopback = (ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved or ip_obj.is_link_local)
    except ValueError:
        pass

    # Strictly validate hostname if not a direct IP address
    if not is_ip:
        if hostname_raw != "localhost":
            if "." not in hostname_raw:
                raise ValueError(f"Invalid URL: '{hostname_raw}' is not a valid domain name or IP address.")
            labels = hostname_raw.split(".")
            if any(len(label) == 0 for label in labels):
                raise ValueError("Invalid URL: Domain cannot contain empty labels or consecutive dots.")
            label_pattern = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$")
            for label in labels:
                if not label_pattern.match(label):
                    raise ValueError(f"Invalid domain label '{label}' in URL.")
            tld = labels[-1]
            if tld.isdigit() or len(tld) < 2:
                raise ValueError(f"Invalid top-level domain (TLD) '{tld}' in URL.")

    base_domain, subdomains = extract_domain_parts(hostname_raw)

    return ParsedURLContext(
        raw_url=raw_url,
        normalized_url=url_to_parse,
        scheme=scheme,
        authority=netloc,
        userinfo=userinfo,
        has_userinfo_at=has_userinfo_at,
        hostname=hostname_raw,
        port=port,
        path=parsed.path or "",
        query=parsed.query or "",
        fragment=parsed.fragment or "",
        base_domain=base_domain,
        subdomains=subdomains,
        is_ip=is_ip,
        is_ipv4=is_ipv4,
        is_ipv6=is_ipv6,
        is_private_or_loopback=is_private_or_loopback
    )

# ==============================================================================
# 4. ADVANCED HEURISTIC DETECTORS
# ==============================================================================

def check_brand_spoofing(ctx: ParsedURLContext) -> Tuple[bool, List[str], str]:
    """
    Evaluates whether verified high-value brands are impersonated in hostnames,
    subdomain trees, typosquatting homoglyphs, or deceptive base domains.
    Returns (is_spoofed, spoofed_brands, detail_rationale).
    """
    spoofed = []
    hostname = ctx.hostname
    base_domain = ctx.base_domain

    for brand, official_domains in OFFICIAL_BRAND_DOMAINS.items():
        if base_domain in official_domains:
            return False, [], "Verified official brand domain."

    for brand, official_domains in OFFICIAL_BRAND_DOMAINS.items():
        if base_domain not in official_domains:
            if brand in base_domain:
                spoofed.append(brand)
            elif any(brand in sub for sub in ctx.subdomains):
                spoofed.append(brand)

    for brand, pattern in BRAND_HOMOGLYPH_PATTERNS.items():
        if brand not in spoofed and re.search(pattern, hostname, re.IGNORECASE):
            official = OFFICIAL_BRAND_DOMAINS.get(brand, set())
            if base_domain not in official:
                spoofed.append(f"{brand} (lookalike typo/homoglyph)")

    if spoofed:
        return True, list(set(spoofed)), f"High-value brand ({', '.join(spoofed)}) detected on unauthorized domain '{base_domain}'."

    return False, [], "No brand impersonation detected in domain boundaries."

def check_suspicious_redirect_parameter(ctx: ParsedURLContext) -> Tuple[bool, str]:
    """
    Safely inspects query parameters for embedded external destination URLs.
    Avoids nested loops or remote network fetching.
    """
    if not ctx.query:
        return False, ""

    try:
        params = parse_qs(ctx.query, keep_blank_values=False)
    except Exception:
        return False, ""

    for key, values in params.items():
        key_lower = key.lower()
        is_redirect_key = (
            key_lower in REDIRECT_QUERY_PARAMS or
            any(rk in key_lower for rk in ("redirect", "destination", "return", "callback", "target", "forward", "goto"))
        )
        if is_redirect_key:
            for val in values:
                decoded = unquote(val).strip().lower()
                if decoded.startswith("http://") or decoded.startswith("https://") or decoded.startswith("//"):
                    short_dest = decoded[:45] + ("..." if len(decoded) > 45 else "")
                    return True, f"Parameter '{key}' contains destination URL: {short_dest}"
    return False, ""

# ==============================================================================
# 5. MACHINE LEARNING FEATURE MATRIX SCHEMA & EXTRACTOR
# ==============================================================================

ML_FEATURE_NAMES: List[str] = [
    "url_length",
    "shannon_entropy",
    "is_ip_host",
    "is_shortener",
    "has_userinfo_at",
    "is_punycode_or_idn",
    "is_brand_spoofing",
    "is_suspicious_tld",
    "subdomain_depth",
    "hyphen_count",
    "is_unencrypted_http",
    "social_eng_keywords_count",
    "has_suspicious_redirect_param"
]

def extract_url_feature_vector(url: str) -> Dict[str, float]:
    """
    Extracts a standardized 13-dimensional numerical feature dictionary.
    Uses the exact same centralized normalization pipeline as the rule engine.
    """
    ctx = normalize_and_validate_url(url)

    entropy = calculate_entropy(ctx.normalized_url)
    is_ip = 1.0 if ctx.is_ip else 0.0
    is_short = 1.0 if ctx.hostname in SHORTENING_SERVICES else 0.0
    has_at = 1.0 if ctx.has_userinfo_at else 0.0
    is_puny = 1.0 if ("xn--" in ctx.hostname or not ctx.hostname.isascii()) else 0.0
    is_spoof_val, _, _ = check_brand_spoofing(ctx)
    is_spoof = 1.0 if is_spoof_val else 0.0
    is_susp_tld = 1.0 if any(ctx.hostname.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0.0
    sub_count = float(len(ctx.subdomains))
    hyphen_count = float(ctx.hostname.count("-"))
    is_http = 1.0 if ctx.scheme != "https" else 0.0
    has_redir, _ = check_suspicious_redirect_parameter(ctx)
    is_redir = 1.0 if has_redir else 0.0

    full_target_text = (ctx.path + "?" + ctx.query).lower() + " " + ctx.hostname
    kw_count = sum(1 for kw in SOCIAL_ENG_KEYWORDS if kw in full_target_text)

    return {
        "url_length": float(len(ctx.normalized_url)),
        "shannon_entropy": entropy,
        "is_ip_host": is_ip,
        "is_shortener": is_short,
        "has_userinfo_at": has_at,
        "is_punycode_or_idn": is_puny,
        "is_brand_spoofing": is_spoof,
        "is_suspicious_tld": is_susp_tld,
        "subdomain_depth": sub_count,
        "hyphen_count": hyphen_count,
        "is_unencrypted_http": is_http,
        "social_eng_keywords_count": float(kw_count),
        "has_suspicious_redirect_param": is_redir
    }

# ==============================================================================
# 6. CORE SCORING & ANALYSIS ENGINE (NO BLIND WHITELIST BYPASS)
# ==============================================================================

def analyze_url(url: str, config: ScannerConfig = CONFIG) -> Dict[str, Any]:
    """
    Performs comprehensive lexical security analysis on a URL.
    
    Priority 1 Architecture: Whitelist matching is treated as one piece of evidence
    with negative/mitigating score influence rather than an unconditional early return.
    """
    ctx = normalize_and_validate_url(url, max_length=config.MAX_URL_LENGTH)

    features: List[Dict[str, Any]] = []
    risk_score = 0.0

    # 1. Trusted Domain Verification (NO EARLY RETURN)
    is_whitelisted = False
    for td in TRUSTED_DOMAINS:
        if ctx.hostname == td or ctx.hostname.endswith("." + td):
            is_whitelisted = True
            break

    if is_whitelisted and not ctx.has_userinfo_at:
        risk_score += config.CREDIT_TRUSTED_DOMAIN
        features.append({
            "name": "Trusted Global Infrastructure",
            "value": f"Verified base domain ({ctx.base_domain})",
            "risk": "Low",
            "rationale": "Domain belongs to recognized reputable global infrastructure; score mitigated.",
            "weight": config.CREDIT_TRUSTED_DOMAIN
        })

    # 2. IP Hostname Detection
    if ctx.is_ip:
        risk_score += config.WEIGHT_IP_HOST
        detail = "Private / Localhost IP" if ctx.is_private_or_loopback else f"Raw IP host ({ctx.hostname})"
        features.append({
            "name": "IP Address Host",
            "value": detail,
            "risk": "High",
            "rationale": "Phishing attackers frequently host kits on bare IP addresses to evade DNS reputation checks.",
            "weight": config.WEIGHT_IP_HOST
        })
    else:
        features.append({
            "name": "IP Address Host",
            "value": "Standard Domain Name",
            "risk": "Low",
            "rationale": "Standard fully qualified domain name structure.",
            "weight": 0.0
        })

    # 3. URL Shortening Services
    if ctx.hostname in SHORTENING_SERVICES:
        risk_score += config.WEIGHT_SHORTENING_SERVICE
        features.append({
            "name": "Shortening Service",
            "value": f"Detected URL shortener ({ctx.hostname})",
            "risk": "High",
            "rationale": "Shorteners mask destination URLs and are frequently used in email/SMS lure campaigns.",
            "weight": config.WEIGHT_SHORTENING_SERVICE
        })
    else:
        features.append({
            "name": "Shortening Service",
            "value": "None",
            "risk": "Low",
            "rationale": "Direct domain landing destination.",
            "weight": 0.0
        })

    # 4. Userinfo Authority Spoofing (@ in authority)
    if ctx.has_userinfo_at:
        risk_score += config.WEIGHT_USERINFO_AT
        features.append({
            "name": "Userinfo Authority Spoofing (@)",
            "value": f"Credentials in authority: {ctx.userinfo[:30]}",
            "risk": "High",
            "rationale": "The @ character in URL authority causes browsers to connect to the host following it, disguising the true destination.",
            "weight": config.WEIGHT_USERINFO_AT
        })

    # 5. Punycode & IDN Homograph Lookalike
    if "xn--" in ctx.hostname or not ctx.hostname.isascii():
        risk_score += config.WEIGHT_PUNYCODE_IDN
        features.append({
            "name": "Punycode / IDN Homograph",
            "value": f"Internationalized domain: {ctx.hostname}",
            "risk": "High",
            "rationale": "Non-ASCII / Punycode domains are often registered with Cyrillic/Greek lookalike characters to deceive users.",
            "weight": config.WEIGHT_PUNYCODE_IDN
        })

    # 6. Brand Impersonation & Typosquatting
    is_spoofed, spoofed_brands, spoof_rationale = check_brand_spoofing(ctx)
    if is_spoofed:
        risk_score += config.WEIGHT_BRAND_SPOOFING
        features.append({
            "name": "Brand Spoofing",
            "value": f"Target brands: {', '.join(spoofed_brands)}",
            "risk": "High",
            "rationale": spoof_rationale,
            "weight": config.WEIGHT_BRAND_SPOOFING
        })

    # 7. Suspicious Destination Query Parameters (Open Redirect Lures)
    has_redirect, redirect_detail = check_suspicious_redirect_parameter(ctx)
    if has_redirect:
        risk_score += config.WEIGHT_OPEN_REDIRECT_PARAM
        features.append({
            "name": "Suspicious Redirect Parameter",
            "value": redirect_detail,
            "risk": "Medium",
            "rationale": "Query parameters contain embedded destination URLs, common in redirect lure chains.",
            "weight": config.WEIGHT_OPEN_REDIRECT_PARAM
        })

    # 8. High-Abuse Suspicious TLD
    matched_tlds = [tld for tld in SUSPICIOUS_TLDS if ctx.hostname.endswith(tld)]
    if matched_tlds:
        risk_score += config.WEIGHT_SUSPICIOUS_TLD
        features.append({
            "name": "Suspicious TLD",
            "value": f"High-risk extension ({matched_tlds[0]})",
            "risk": "Medium",
            "rationale": "Top-level domain exhibits high correlation with disposable phishing infrastructure.",
            "weight": config.WEIGHT_SUSPICIOUS_TLD
        })

    # 9. Subdomain Depth
    if len(ctx.subdomains) > 3:
        depth = len(ctx.subdomains)
        risk_score += config.WEIGHT_EXCESSIVE_SUBDOMAINS
        features.append({
            "name": "Subdomain Depth",
            "value": f"{depth} subdomain levels deep",
            "risk": "Medium",
            "rationale": "Deep subdomain hierarchies are often used to conceal real domain boundaries on mobile screens.",
            "weight": config.WEIGHT_EXCESSIVE_SUBDOMAINS
        })

    # 10. Hyphens in Hostname
    hyphen_count = ctx.hostname.count("-")
    if hyphen_count >= 2:
        risk_score += config.WEIGHT_MULTIPLE_HYPHENS
        features.append({
            "name": "Hyphens in Domain",
            "value": f"{hyphen_count} hyphens detected",
            "risk": "Medium",
            "rationale": "Multiple hyphens are commonly used to craft deceptive lookalike brand combinations.",
            "weight": config.WEIGHT_MULTIPLE_HYPHENS
        })
    elif hyphen_count == 1:
        risk_score += config.WEIGHT_SINGLE_HYPHEN
        features.append({
            "name": "Hyphens in Domain",
            "value": "1 hyphen detected",
            "risk": "Low",
            "rationale": "Single hyphen detected in host.",
            "weight": config.WEIGHT_SINGLE_HYPHEN
        })

    # 11. URL Length Analysis
    url_len = len(ctx.normalized_url)
    if url_len > 80:
        risk_score += config.WEIGHT_EXCESSIVE_LENGTH
        features.append({
            "name": "URL Length",
            "value": f"{url_len} chars (Excessive length)",
            "risk": "High",
            "rationale": "Unusually long URLs are frequently used to hide malicious tokens or query strings.",
            "weight": config.WEIGHT_EXCESSIVE_LENGTH
        })
    elif url_len > 55:
        risk_score += config.WEIGHT_MODERATE_LENGTH
        features.append({
            "name": "URL Length",
            "value": f"{url_len} chars (Moderately long)",
            "risk": "Medium",
            "rationale": "Moderately long URL length.",
            "weight": config.WEIGHT_MODERATE_LENGTH
        })
    else:
        features.append({
            "name": "URL Length",
            "value": f"{url_len} chars (Normal)",
            "risk": "Low",
            "rationale": "Standard concise URL structure.",
            "weight": 0.0
        })

    # 12. Transport Security Protocol (HTTPS vs HTTP)
    if ctx.scheme != "https":
        risk_score += config.WEIGHT_UNENCRYPTED_HTTP
        features.append({
            "name": "Protocol Security",
            "value": "Unencrypted HTTP Scheme",
            "risk": "Medium",
            "rationale": "Unencrypted HTTP connections are vulnerable to interception and active tampering.",
            "weight": config.WEIGHT_UNENCRYPTED_HTTP
        })
    else:
        features.append({
            "name": "Protocol Security",
            "value": "HTTPS Encrypted Scheme",
            "risk": "Low",
            "rationale": "Standard TLS encrypted transport protocol.",
            "weight": 0.0
        })

    # 13. Social Engineering Keyword Heuristics
    full_path_query = (ctx.path + "?" + ctx.query).lower()
    found_keywords = [kw for kw in SOCIAL_ENG_KEYWORDS if kw in full_path_query or kw in ctx.hostname]
    if found_keywords:
        kw_weight = config.WEIGHT_SOCIAL_ENG_KEYWORDS if (len(found_keywords) > 1 or any(kw in ctx.hostname for kw in found_keywords)) else 1.0
        risk_score += kw_weight
        features.append({
            "name": "Social Engineering Keywords",
            "value": f"Keywords found: {', '.join(found_keywords)}",
            "risk": "High" if kw_weight >= 2.0 else "Medium",
            "rationale": "Contains security or credential harvesting terminology commonly found in phishing lures.",
            "weight": kw_weight
        })

    # 14. Shannon Entropy Randomness
    entropy = calculate_entropy(ctx.normalized_url)
    if entropy > config.ENTROPY_SUSPICIOUS_THRESHOLD:
        risk_score += config.WEIGHT_HIGH_ENTROPY
        features.append({
            "name": "URL Shannon Entropy",
            "value": f"{entropy:.2f} (High randomness)",
            "risk": "Medium",
            "rationale": "Elevated entropy indicates possible algorithmic domain generation (DGA) or token obfuscation.",
            "weight": config.WEIGHT_HIGH_ENTROPY
        })

    # 15. Score Bounding & Calibration
    final_score = round(min(10.0, max(0.0, risk_score)), 1)

    # 16. Definitive Threat Classification
    if final_score >= config.THRESHOLD_CRITICAL:
        risk_level = "Critical Phishing Threat"
        is_phishing = True
    elif final_score >= config.THRESHOLD_HIGH:
        risk_level = "High Risk"
        is_phishing = True
    elif final_score >= config.THRESHOLD_MODERATE:
        risk_level = "Moderate Risk"
        is_phishing = False
    else:
        risk_level = "Safe / Low Risk" if final_score > 0 else "Safe"
        is_phishing = False

    threat_indicators = [f["name"] for f in features if f.get("risk") in ["High", "Medium"]]

    # 17. Actionable Defensive Recommendations
    recommendations = []
    if is_phishing:
        recommendations.append("DO NOT enter passwords, MFA codes, or financial details on this link.")
        recommendations.append("Verify the official website URL directly via an independent search engine or official app.")
        recommendations.append("Check for spoofed brand names, misspellings, or deceptive subdomains in the address bar.")
    elif risk_level == "Moderate Risk":
        recommendations.append("Exercise caution: URL exhibits suspicious structural patterns.")
        recommendations.append("Ensure the sender and domain identity match before submitting any confidential data.")
    else:
        recommendations.append("URL demonstrates standard lexical security patterns.")
        recommendations.append("Ensure HTTPS SSL lock icon is present in your browser address bar.")

    return {
        "url": url,
        "domain": ctx.hostname,
        "risk_score": final_score,
        "risk_level": risk_level,
        "is_phishing": is_phishing,
        "features": features,
        "threat_indicators": threat_indicators,
        "recommendations": recommendations
    }
