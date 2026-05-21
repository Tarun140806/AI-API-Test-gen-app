from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.runner_service import run_test_cases
from services.supabase_service import get_all_test_runs, get_test_cases_by_run

router = APIRouter(prefix="/run", tags=["Runner"])

class RunRequest(BaseModel):
    test_run_id: str
    api_url: str

@router.post("/")
async def run(request: RunRequest):
    """
    Takes a test_run_id and api_url, executes all test cases and returns results.
    """
    try:
        results = await run_test_cases(request.test_run_id, request.api_url)
        return {
            "success": True,
            **results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_history():
    """
    Returns all past test runs with their test cases.
    """
    try:
        test_runs = get_all_test_runs()
        history = []
        for run in test_runs:
            test_cases = get_test_cases_by_run(run["id"])
            passed = sum(1 for tc in test_cases if tc.get("passed") == True)
            failed = sum(1 for tc in test_cases if tc.get("passed") == False)
            history.append({
                "test_run_id": run["id"],
                "api_url": run["api_url"],
                "method": run["method"],
                "created_at": run["created_at"],
                "total": len(test_cases),
                "passed": passed,
                "failed": failed,
                "test_cases": test_cases
            })
        return {"success": True, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))