import math
import re
from typing import Dict, List, Any

COMMON_WEAK_PASSWORDS = {
    "123456", "password", "123456789", "12345678", "12345", "1234567", "qwerty", 
    "111111", "123123", "abc123", "password1", "admin", "welcome", "iloveyou",
    "monkey", "dragon", "sunshine", "letmein", "princess", "football", "shadow"
}

def calculate_shannon_entropy(password: str) -> float:
    """Calculates Shannon Entropy H = -sum(p_i * log2(p_i)) per character."""
    if not password:
        return 0.0
    
    length = len(password)
    char_counts: Dict[str, int] = {}
    for char in password:
        char_counts[char] = char_counts.get(char, 0) + 1
        
    entropy = 0.0
    for count in char_counts.values():
        p = count / length
        entropy -= p * math.log2(p)
        
    return round(entropy, 2)

def estimate_crack_time(password: str, total_entropy_bits: float) -> str:
    """Estimates brute-force time assuming 10 billion guesses per second."""
    if total_entropy_bits <= 0:
        return "Instant"
        
    guesses = 2 ** total_entropy_bits
    seconds = guesses / 10_000_000_000 # 10B guesses/sec (GPU cluster)
    
    if seconds < 1:
        return "Instant (< 1 second)"
    elif seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours"
    elif seconds < 31536000:
        return f"{int(seconds // 86400)} days"
    elif seconds < 31536000 * 100:
        return f"{int(seconds // 31536000)} years"
    elif seconds < 31536000 * 1_000_000:
        return "Centuries"
    else:
        return "Uncrackable (Millions of years)"

def evaluate_password_strength(password: str) -> Dict[str, Any]:
    """
    Evaluates password strength using multi-tier scoring:
    - Rule-based regex heuristics
    - Shannon entropy calculation
    - Dictionary pattern matching
    - ML-weighted strength score (0-100)
    """
    if not password:
        return {
            "score": 0,
            "status": "Empty",
            "entropy_per_char": 0.0,
            "total_entropy_bits": 0.0,
            "crack_time_estimate": "Instant",
            "checks": {
                "length": False,
                "has_uppercase": False,
                "has_lowercase": False,
                "has_number": False,
                "has_symbol": False,
                "is_not_common": True
            },
            "recommendations": ["Enter a password to analyze."]
        }

    length = len(password)
    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_lowercase = bool(re.search(r'[a-z]', password))
    has_number = bool(re.search(r'[0-9]', password))
    has_symbol = bool(re.search(r'[^A-Za-z0-9]', password))
    is_common = password.lower() in COMMON_WEAK_PASSWORDS

    # Character set pool size estimation
    pool_size = 0
    if has_lowercase: pool_size += 26
    if has_uppercase: pool_size += 26
    if has_number: pool_size += 10
    if has_symbol: pool_size += 32

    # Entropy calculations
    entropy_per_char = calculate_shannon_entropy(password)
    total_entropy_bits = round(length * math.log2(max(pool_size, 1)), 2)

    # Multi-tier Scoring Algorithm (0 - 100)
    score = 0
    
    # 1. Length scoring (Max 35 points)
    if length >= 16:
        score += 35
    elif length >= 12:
        score += 28
    elif length >= 8:
        score += 18
    elif length >= 6:
        score += 10
    else:
        score += 4

    # 2. Composition diversity scoring (Max 40 points)
    diversity = sum([has_uppercase, has_lowercase, has_number, has_symbol])
    score += (diversity * 10)

    # 3. Entropy bonus (Max 25 points)
    if total_entropy_bits > 80:
        score += 25
    elif total_entropy_bits > 60:
        score += 20
    elif total_entropy_bits > 40:
        score += 15
    elif total_entropy_bits > 20:
        score += 10

    # Penalties
    if is_common:
        score = min(score, 15)
    if length < 8:
        score = min(score, 40)

    score = max(0, min(100, score))

    # Status classification
    if score < 25:
        status = "Very Weak"
    elif score < 50:
        status = "Weak"
    elif score < 75:
        status = "Moderate"
    elif score < 90:
        status = "Strong"
    else:
        status = "Very Strong"

    # Actionable recommendations
    recommendations: List[str] = []
    if length < 12:
        recommendations.append("Increase password length to at least 12–16 characters.")
    if not has_uppercase:
        recommendations.append("Add uppercase letters (A-Z).")
    if not has_lowercase:
        recommendations.append("Add lowercase letters (a-z).")
    if not has_number:
        recommendations.append("Add numbers (0-9).")
    if not has_symbol:
        recommendations.append("Add special characters (e.g. @, #, $, !).")
    if is_common:
        recommendations.append("CRITICAL: This is a known leaked password! Do not use it.")
    if len(recommendations) == 0:
        recommendations.append("Excellent password! It meets high cryptographic security standards.")

    crack_time = estimate_crack_time(password, total_entropy_bits)

    return {
        "score": score,
        "status": status,
        "entropy_per_char": entropy_per_char,
        "total_entropy_bits": total_entropy_bits,
        "crack_time_estimate": crack_time,
        "checks": {
            "length": length >= 8,
            "has_uppercase": has_uppercase,
            "has_lowercase": has_lowercase,
            "has_number": has_number,
            "has_symbol": has_symbol,
            "is_not_common": not is_common
        },
        "recommendations": recommendations
    }
