from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_test_cases
from services.supabase_service import save_test_run, save_test_cases

router = APIRouter(prefix="/generate", tags=["Generate"])

# This defines what the frontend sends us
class GenerateRequest(BaseModel):
    api_url: str
    method: str
    description: str = ""  # Optional

@router.post("/")
async def generate(request: GenerateRequest):
    """
    Main endpoint — takes an API URL and generates test cases using AI.
    """
    try:
        # Step 1 — Save the test run to database, get its ID
        test_run = save_test_run(request.api_url, request.method)
        test_run_id = test_run["id"]

        # Step 2 — Call Groq AI to generate test cases
        generation_result = generate_test_cases(
            request.api_url,
            request.method,
            request.description
        )
        test_cases = generation_result["test_cases"]
        source = generation_result["source"]

        # Step 3 — Save all generated test cases to database
        saved_cases = save_test_cases(test_run_id, test_cases)

        # Step 4 — Return everything to frontend
        return {
            "success": True,
            "test_run_id": test_run_id,
            "api_url": request.api_url,
            "method": request.method,
            "source": source,
            "total_cases": len(test_cases),
            "test_cases": test_cases
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))