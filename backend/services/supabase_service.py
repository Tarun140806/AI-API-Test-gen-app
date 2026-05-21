from typing import Optional

from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_KEY. Set them in backend/.env (SUPABASE_URL=..., SUPABASE_KEY=...)."
    )
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def save_test_run(api_url: str, method: str):
    """
    Creates a new test run record in the database.
    Returns the created test run with its ID.
    """
    response = supabase.table("test_runs").insert({
        "api_url": api_url,
        "method": method
    }).execute()

    if getattr(response, "error", None):
        raise RuntimeError(f"Supabase insert(test_runs) failed: {response.error}")
    if not response.data:
        raise RuntimeError("Supabase insert(test_runs) returned no data.")
    return response.data[0]

def save_test_cases(test_run_id: str, test_cases: list, method: str):
    """
    Saves all generated test cases linked to a test run.
    """
    rows = []
    for tc in test_cases:
        # Store body + headers in `input` (no separate headers column required)
        rows.append({
            "test_run_id": test_run_id,
            "name": tc.get("name"),
            "method": method,
            "description": tc.get("description"),
            "input": {
                "body": tc.get("body"),
                "headers": tc.get("headers") or {},
            },
            "expected_status": tc.get("expected_status"),
            "actual_status": None,   # Will be filled after running
            "passed": None           # Will be filled after running
        })

    response = supabase.table("test_cases").insert(rows).execute()
    if getattr(response, "error", None):
        raise RuntimeError(f"Supabase insert(test_cases) failed: {response.error}")
    return response.data

def get_all_test_runs():
    """
    Fetches all past test runs for history view.
    """
    response = supabase.table("test_runs").select("*").order("created_at", desc=True).execute()
    if getattr(response, "error", None):
        raise RuntimeError(f"Supabase select(test_runs) failed: {response.error}")
    return response.data

def get_test_cases_by_run(test_run_id: str):
    """
    Fetches all test cases for a specific test run.
    """
    response = supabase.table("test_cases").select("*").eq("test_run_id", test_run_id).execute()
    if getattr(response, "error", None):
        raise RuntimeError(f"Supabase select(test_cases) failed: {response.error}")
    return response.data

def update_test_case_result(test_case_id: str, actual_status: Optional[int], passed: bool):
    """
    Updates a test case with the actual result after running.
    """
    payload: dict = {"passed": passed}
    if actual_status is not None:
        payload["actual_status"] = actual_status

    response = supabase.table("test_cases").update(payload).eq("id", test_case_id).execute()
    if getattr(response, "error", None):
        raise RuntimeError(f"Supabase update(test_cases) failed: {response.error}")
    return response.data