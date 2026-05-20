from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
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

    return response.data[0]

def save_test_cases(test_run_id: str, test_cases: list):
    """
    Saves all generated test cases linked to a test run.
    """
    rows = []
    for tc in test_cases:
        rows.append({
            "test_run_id": test_run_id,
            "name": tc.get("name"),
            "description": tc.get("description"),
            "input": tc.get("body"),
            "expected_status": tc.get("expected_status"),
            "actual_status": None,   # Will be filled after running
            "passed": None           # Will be filled after running
        })

    response = supabase.table("test_cases").insert(rows).execute()
    return response.data

def get_all_test_runs():
    """
    Fetches all past test runs for history view.
    """
    response = supabase.table("test_runs").select("*").order("created_at", desc=True).execute()
    return response.data

def get_test_cases_by_run(test_run_id: str):
    """
    Fetches all test cases for a specific test run.
    """
    response = supabase.table("test_cases").select("*").eq("test_run_id", test_run_id).execute()
    return response.data