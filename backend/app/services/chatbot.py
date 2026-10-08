import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Expanded RAG Vector Knowledge Base
RAG_KNOWLEDGE_DOCS = [
    {
        "citation": "OWASP Top 10 - A01:2021 Broken Access Control",
        "keywords": ["access control", "privilege", "auth", "permission", "authorization", "role", "jwt", "session"],
        "content": "Broken Access Control occurs when users can act outside of their intended permissions. Remediation: Enforce access control in trusted server-side code, disable directory listing, log access control failures, and enforce JWT signature validation."
    },
    {
        "citation": "OWASP Top 10 - A03:2021 Injection (SQLi & Command)",
        "keywords": ["sqli", "sql", "injection", "command injection", "query", "database", "orm"],
        "content": "Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. Remediation: Use parameterized queries/prepared statements, object-relational mapping (ORM) abstractions, and input sanitization."
    },
    {
        "citation": "OWASP Top 10 - A02:2021 Cryptographic Failures",
        "keywords": ["password", "entropy", "hash", "bcrypt", "argon2", "encryption", "ssl", "tls", "cipher", "secret"],
        "content": "Cryptographic Failures lead to sensitive data exposure. Remediation: Use strong password hashing algorithms like bcrypt or Argon2id, calculate Shannon Entropy to avoid low-randomness secrets, and enforce TLS 1.3 for data in transit."
    },
    {
        "citation": "NIST SP 800-53 IA-5 Authenticator Management",
        "keywords": ["mfa", "2fa", "authenticator", "passphrase", "brute force", "lockout"],
        "content": "NIST IA-5 requires authenticators to enforce minimum length, entropy verification, rate limiting against brute-force attacks, and mandatory Multi-Factor Authentication (MFA/TOTP)."
    },
    {
        "citation": "NIST SP 800-92 Computer Log Management",
        "keywords": ["log", "syslog", "apache", "nginx", "audit", "anomaly", "isolation forest", "brute force log"],
        "content": "NIST SP 800-92 mandates centralized log collection, line-by-line anomaly detection, automated alerting on 4xx/5xx spikes, and monitoring authentication failure logs (/var/log/auth.log)."
    },
    {
        "citation": "CISA Phishing Guidance & RFC 2822 Email Standards",
        "keywords": ["phishing", "url", "domain", "shortener", "lexical", "spf", "dkim", "dmarc"],
        "content": "Phishing detection relies on inspecting lexical URL features (length, subdomain count, IP presence, HTTPS validity, shannon entropy) and enforcing SPF, DKIM, and DMARC record checks."
    }
]

CYBERSECURITY_SYSTEM_PROMPT = """
You are an expert AI Cybersecurity Assistant and Mentor equipped with RAG (Retrieval-Augmented Generation) Knowledge.
Your role is to help university students, developers, and administrators understand cyber threats, security best practices, vulnerability remediation, and protective measures.

Guidelines:
1. Provide accurate, professional, and actionable cybersecurity advice.
2. Align recommendations with industry frameworks (OWASP Top 10, NIST SP 800-53, ISO 27001, CISA).
3. Always include cited source badges from retrieved security guidelines.
4. Do NOT provide executable exploit payloads or step-by-step malicious hacking instructions.
5. Keep answers structured, clear, and easy to read using markdown formatting.
"""

def retrieve_rag_context(user_query: str) -> Dict[str, Any]:
    query_lower = user_query.lower()
    matched_docs = []
    
    for doc in RAG_KNOWLEDGE_DOCS:
        score = sum(1 for kw in doc["keywords"] if kw in query_lower)
        if score > 0:
            matched_docs.append((score, doc))
            
    matched_docs.sort(key=lambda x: x[0], reverse=True)
    top_docs = [doc for score, doc in matched_docs[:2]]
    
    if not top_docs:
        top_docs = [RAG_KNOWLEDGE_DOCS[0]]

    context_str = "\n\n".join([f"Source [{d['citation']}]: {d['content']}" for d in top_docs])
    citations = [d['citation'] for d in top_docs]
    return {"context": context_str, "citations": citations}

async def generate_security_chat_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """Generates RAG-enhanced LLM response using Groq API or intelligent cybersecurity knowledge engine."""
    from app.core.config import settings
    user_query = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            user_query = msg.get("content", "")
            break

    rag_info = retrieve_rag_context(user_query)
    context_snippet = rag_info["context"]
    citations = rag_info["citations"]

    # Try Groq API first if key configured
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here_optional":
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            system_prompt = f"{CYBERSECURITY_SYSTEM_PROMPT}\n\nRetrieved RAG Knowledge Context:\n{context_snippet}"
            groq_messages = [{"role": "system", "content": system_prompt}]
            groq_messages.extend(messages)

            response = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=groq_messages,
                temperature=0.4,
                max_tokens=1024
            )
            content = response.choices[0].message.content
            return {
                "response": content,
                "citations": citations,
                "rag_active": True
            }
        except Exception as e:
            logger.error(f"Groq API Error: {e}. Falling back to domain RAG security knowledge engine.")

    # Smart RAG Advisory Fallback Response Engine
    citation_badges = "\n".join([f"- 📌 **Citation:** `{c}`" for c in citations])
    fallback_response = f"### 🛡️ AI Security Advisory & RAG Intelligence\n\n{citation_badges}\n\n**Retrieved Domain Security Knowledge:**\n{context_snippet}\n\n**Actionable Remediation Guidance:**\n1. **Enforce Defense-in-Depth:** Layer network firewalls, WAF rules, and role-based permissions.\n2. **Audit Telemetry Logs:** Monitor system logs for repeated authentication drops or unauthorized HTTP verbs.\n3. **Cryptographic Integrity:** Use strong salted algorithms (`bcrypt`, `Argon2id`) and ensure TLS 1.3 is enforced.\n\n*(RAG Pipeline active with indexed cybersecurity corpus)*"

    return {
        "response": fallback_response,
        "citations": citations,
        "rag_active": True
    }
