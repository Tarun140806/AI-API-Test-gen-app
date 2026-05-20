import json
from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_test_cases(api_url: str, method: str, description: str = ""):
    """
    Takes an API endpoint and generates test cases using Groq AI.
    Returns a list of test case dictionaries.
    """
    
    # This is the prompt we send to the AI
    # The better this prompt, the better the test cases
    prompt = f"""
    You are an expert API testing engineer. Generate comprehensive test cases for the following API endpoint.

    API URL: {api_url}
    HTTP Method: {method}
    Description: {description if description else "No description provided"}

    Generate exactly 6 test cases covering:
    1. Happy path (valid request, expect 200)
    2. Missing required fields (expect 400)
    3. Invalid data types (expect 400 or 422)
    4. Unauthorized request (expect 401)
    5. Edge case (empty strings, boundary values)
    6. Large/unexpected input (expect 400 or 500)

    Respond ONLY with a JSON array. No explanation, no markdown, just raw JSON.
    Each test case must have these exact fields:
    - name: string (short test name)
    - description: string (what this test checks)
    - headers: object (HTTP headers to send)
    - body: object or null (request body, null for GET)
    - expected_status: integer (expected HTTP status code)

    Example format:
    [
      {{
        "name": "Valid request",
        "description": "Should return 200 with valid input",
        "headers": {{"Content-Type": "application/json"}},
        "body": {{"key": "value"}},
        "expected_status": 200
      }}
    ]
    """

    # Send prompt to Groq
    response = client.chat.completions.create(
        model="llama3-70b-8192",  # Most powerful free Groq model
        messages=[
            {
                "role": "system",
                "content": "You are an API testing expert. Always respond with valid JSON only, no markdown or explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,  # Lower = more consistent, less random
        max_tokens=2000
    )

    # Extract the text response
    raw_response = response.choices[0].message.content.strip()

    # Parse JSON — remove markdown if AI accidentally adds it
    if raw_response.startswith("```"):
        raw_response = raw_response.split("```")[1]
        if raw_response.startswith("json"):
            raw_response = raw_response[4:]

    test_cases = json.loads(raw_response)
    return test_cases