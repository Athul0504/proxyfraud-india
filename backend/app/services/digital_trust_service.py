import re
from urllib.parse import urlparse
from typing import List, Dict, Any

TRUSTED_DOMAINS = {
    "google.com", "microsoft.com", "apple.com", "amazon.in", "amazon.com",
    "sbi.co.in", "icicibank.com", "hdfcbank.com", "github.com"
}

TRUSTED_BRANDS = [
    "google", "microsoft", "apple", "amazon", "sbi", "icicibank", "hdfcbank", "paytm"
]

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "password", 
    "banking", "signin", "auth", "confirm", "credential", "wallet", "kyc"
]

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "goo.gl"
}

TYPOSQUAT_PATTERNS = [
    (r"g[0o]{2}gle", "google"),
    (r"micr[0o]s[0o]ft", "microsoft"),
    (r"appl[e1]", "apple"),
    (r"5bi", "sbi"),
    (r"hdfc", "hdfcbank"),
]

def normalize_url(raw_url: str) -> str:
    url = raw_url.strip()
    if not url:
        return ""
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url
    return url

def extract_hostname(url: str) -> str:
    try:
        parsed = urlparse(url)
        return (parsed.hostname or "").lower()
    except Exception:
        return ""

def get_base_domain(hostname: str) -> str:
    parts = hostname.split('.')
    if len(parts) >= 2:
        if len(parts) >= 3 and parts[-2] in ["co", "com", "gov", "ac", "org", "net"] and len(parts[-1]) <= 3:
            return ".".join(parts[-3:])
        return ".".join(parts[-2:])
    return hostname

def analyze_url_service(raw_url: str) -> Dict[str, Any]:
    if not raw_url or not raw_url.strip():
        raise ValueError("URL field cannot be empty.")
    
    normalized = normalize_url(raw_url)
    hostname = extract_hostname(normalized)
    
    if not hostname or "." not in hostname:
        raise ValueError("Invalid URL or domain format. Please enter a valid Web URL (e.g., https://example.com).")
    
    base_domain = get_base_domain(hostname)
    
    risk_score = 0
    detected_risk_signals: List[str] = []
    positive_signals: List[str] = []
    
    # 1. HTTPS Check
    if normalized.startswith("https://"):
        positive_signals.append("Uses secure HTTPS encrypted protocol")
        risk_score -= 5
    else:
        detected_risk_signals.append("Uses unencrypted HTTP protocol (Vulnerable to eavesdropping)")
        risk_score += 15
        
    # 2. Trusted Organization Domain Check
    is_trusted = base_domain in TRUSTED_DOMAINS or hostname in TRUSTED_DOMAINS
    if is_trusted:
        positive_signals.append(f"Domain '{base_domain}' belongs to verified trusted organization registry")
        risk_score -= 30
    else:
        detected_risk_signals.append("Domain is not present in verified trusted domain registry")
        risk_score += 10
        
    # If domain is not trusted, perform comprehensive anomaly checks
    if not is_trusted:
        # 3. Look-alike / Typosquatting Check
        for pattern, brand in TYPOSQUAT_PATTERNS:
            if re.search(pattern, hostname) and brand not in base_domain:
                detected_risk_signals.append(f"Look-alike character substitution / typosquatting targeting brand '{brand}'")
                risk_score += 45
                break
                
        OFFICIAL_BRAND_DOMAINS = {
            "google": "google.com",
            "microsoft": "microsoft.com",
            "apple": "apple.com",
            "amazon": "amazon.in",
            "sbi": "sbi.co.in",
            "icicibank": "icicibank.com",
            "hdfcbank": "hdfcbank.com",
            "hdfc": "hdfcbank.com",
            "paytm": "paytm.com"
        }
        # 4. Brand Keyword Mismatch / Spoofing Check
        for brand, official_domain in OFFICIAL_BRAND_DOMAINS.items():
            if brand in hostname and base_domain != official_domain:
                detected_risk_signals.append(f"Domain contains brand keyword '{brand}' but registered domain '{base_domain}' is not official ({official_domain})")
                risk_score += 35
                break
                
        # 5. Suspicious Keywords
        found_kw = [kw for kw in SUSPICIOUS_KEYWORDS if kw in normalized.lower()]
        if found_kw:
            detected_risk_signals.append(f"Contains sensitive authentication/phishing keywords: {', '.join(found_kw[:3])}")
            risk_score += 15 * min(len(found_kw), 3)
            
        # 6. Direct IP Hostname Check
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
            detected_risk_signals.append("Host uses direct IP address instead of registered domain name")
            risk_score += 35
            
        # 7. Shortener Service Check
        if base_domain in SHORTENER_DOMAINS:
            detected_risk_signals.append("Uses URL shortening service hiding actual target destination")
            risk_score += 25
            
        # 8. Excessive Subdomains
        subdomain_parts = hostname.split('.')
        if len(subdomain_parts) > 3:
            detected_risk_signals.append("Excessive subdomain depth structure detected")
            risk_score += 15
            
        # 9. Unusually Long Hostname & Hyphenation
        if len(hostname) > 30:
            detected_risk_signals.append(f"Unusually long hostname structure ({len(hostname)} characters)")
            risk_score += 10
        if hostname.count('-') >= 2:
            detected_risk_signals.append("Multiple hyphens used in domain name structure")
            risk_score += 10

    # Clamp risk score between 0 and 100
    final_score = max(0, min(100, risk_score))
    
    # Prototype Risk Thresholds: 0-29 LOW, 30-59 MEDIUM, 60-79 HIGH, 80-100 CRITICAL
    if final_score <= 29:
        risk_level = "LOW"
    elif final_score <= 59:
        risk_level = "MEDIUM"
    elif final_score <= 79:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
        
    is_suspicious = final_score >= 60
    
    # Explainable Risk Summary
    if final_score >= 80:
        explanation = f"High-risk URL (Score: {final_score}/100): Demonstrates multiple severe threat signals including potential brand spoofing, authentication keywords, and suspicious domain infrastructure."
    elif final_score >= 60:
        explanation = f"High-risk URL (Score: {final_score}/100): Displays suspicious domain characteristics and potential security anomalies. Caution advised."
    elif final_score >= 30:
        explanation = f"Medium-risk URL (Score: {final_score}/100): Unverified domain with minor security anomalies or unencrypted HTTP protocol."
    else:
        explanation = f"Low-risk URL (Score: {final_score}/100): Verified domain alignment or standard safe web address characteristics."

    return {
        "url": raw_url,
        "normalized_url": normalized,
        "domain": hostname,
        "risk_score": final_score,
        "risk_level": risk_level,
        "is_suspicious": is_suspicious,
        "detected_risk_signals": detected_risk_signals,
        "positive_signals": positive_signals,
        "explanation": explanation
    }
