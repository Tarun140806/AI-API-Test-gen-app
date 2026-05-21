from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.runner_service import run_test_cases

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