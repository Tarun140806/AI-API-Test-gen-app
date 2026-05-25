import json
from groq import Groq
from config import GROQ_API_KEY

if not GROQ_API_KEY:
    raise RuntimeError("Missing GROQ_API_KEY. Set it in backend/.env")

client = Groq(api_key=GROQ_API_KEY)

def _extract_json_array(raw_text: str) -> str:
    raw_response = (raw_text or "").strip()
    if "```" in raw_response:
        parts = raw_response.split("```")
        for part in parts:
            cleaned = part.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            if cleaned.startswith("["):
                raw_response = cleaned
                break
    start = raw_response.find("[")
    end = raw_response.rfind("]") + 1
    if start == -1 or end == 0:
        return ""
    return raw_response[start:end]

def _default_test_cases(method: str, description: str = "") -> list:
    upper_method = (method or "GET").upper()
    default_body = None if upper_method == "GET" else {"sample": "value"}
    return [
        {
            "name": "Happy path request",
            "description": f"Valid {upper_method} request. {description}",
            "headers": {"Content-Type": "application/json"},
            "body": default_body,
            "expected_status": 200,
        },
        {
            "name": "Missing required fields",
            "description": "Request omits required fields and should fail validation.",
            "headers": {"Content-Type": "application/json"},
            "body": {} if upper_method != "GET" else None,
            "expected_status": 400,
        },
        {
            "name": "Invalid data types",
            "description": "Request uses invalid data types.",
            "headers": {"Content-Type": "application/json"},
            "body": {"id": "not-a-number"} if upper_method != "GET" else None,
            "expected_status": 422,
        },
        {
            "name": "Unauthorized request",
            "description": "No auth token should be rejected.",
            "headers": {},
            "body": default_body,
            "expected_status": 401,
        },
        {
            "name": "Edge case values",
            "description": "Empty strings and boundary values.",
            "headers": {"Content-Type": "application/json"},
            "body": {"name": "", "count": 0} if upper_method != "GET" else None,
            "expected_status": 400,
        },
        {
            "name": "Large payload input",
            "description": "Large input should be handled safely.",
            "headers": {"Content-Type": "application/json"},
            "body": {"data": "x" * 100} if upper_method != "GET" else None,
            "expected_status": 400,
        },
    ]

def generate_test_cases(api_url: str, method: str, description: str = "") -> dict:
    
    # Try to get RAG context
    from services.rag_service import retrieve_relevant_context
    query = f"{method} {api_url} {description}"
    rag_context = retrieve_relevant_context(query)

    # Build prompt with or without RAG context
    rag_section = ""
    if rag_context:
        rag_section = f"""

Relevant API Documentation:
{rag_context}

Use this documentation to generate more accurate and business-specific test cases.
"""

    prompt = f"""
You are an expert API testing engineer. Generate exactly 6 test cases for this API endpoint.

API URL: {api_url}
HTTP Method: {method}
Description: {description if description else "No description provided"}
{rag_section}
Rules:
- Respond ONLY with a valid JSON array. No markdown, no explanation.
- Each test case must have: name, description, headers, body, expected_status
- body must be null for GET requests
- For large input test case: use a plain string of exactly 50 "a" characters. Never use code like "a".repeat(1000)
- Keep all string values short and simple
- If API documentation is provided above, use it to generate business-specific test cases

Test cases to cover:
1. Happy path - valid request
2. Missing required fields (expect 400 or 422)
3. Invalid data types
4. Unauthorized - no auth header
5. Edge case - empty strings or zero values
6. Large input - body with a 50 character string

JSON format:
[
  {{
    "name": "Happy Path",
    "description": "Valid request should succeed",
    "headers": {{"Content-Type": "application/json"}},
    "body": {{"key": "value"}},
    "expected_status": 200
  }}
]
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an API testing expert. Always respond with valid JSON array only. Never use JavaScript code inside JSON values."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=1500
        )

        raw_response = _extract_json_array(response.choices[0].message.content or "")

        if not raw_response:
            return {"test_cases": _default_test_cases(method, description), "source": "fallback"}

        test_cases = json.loads(raw_response)

        if not isinstance(test_cases, list) or len(test_cases) == 0:
            return {"test_cases": _default_test_cases(method, description), "source": "fallback"}

        return {"test_cases": test_cases, "source": "ai"}

    except json.JSONDecodeError:
        return {"test_cases": _default_test_cases(method, description), "source": "fallback"}
    except Exception as e:
        return {"test_cases": _default_test_cases(method, description), "source": "fallback"}