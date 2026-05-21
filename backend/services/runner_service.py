from typing import Any, Dict, Optional, Tuple

import httpx
from services.supabase_service import get_test_cases_by_run, update_test_case_result


def _parse_request_payload(test_case: dict) -> Tuple[Dict, Optional[Any]]:
    """Read headers/body from stored input (new shape) or legacy flat input."""
    stored = test_case.get("input")
    if isinstance(stored, dict) and ("headers" in stored or "body" in stored):
        return stored.get("headers") or {}, stored.get("body")
    return test_case.get("headers") or {}, stored

def status_matches(actual: int, expected: int) -> bool:
    validation_errors = {400, 422}
    if actual in validation_errors and expected in validation_errors:
        return True
    return actual == expected

async def run_test_cases(test_run_id: str, api_url: str):
    """
    Fetches all test cases for a run and executes them one by one.
    Returns results with pass/fail for each.
    """
    test_cases = get_test_cases_by_run(test_run_id)
    results = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for tc in test_cases:
            try:
                method = (tc.get("method") or "GET").upper()
                headers, body = _parse_request_payload(tc)

                # Avoid sending a JSON body on GET/HEAD (can break some APIs)
                request_kwargs = {
                    "method": method,
                    "url": api_url,
                    "headers": headers,
                }
                if method not in ("GET", "HEAD") and body is not None:
                    request_kwargs["json"] = body

                response = await client.request(**request_kwargs)

                actual_status = response.status_code
                expected_status = tc.get("expected_status")
                if expected_status is not None:
                    expected_status = int(expected_status)
                passed = status_matches(actual_status, expected_status)

                # Update result in Supabase
                update_test_case_result(tc["id"], actual_status, passed)

                results.append({
                    "test_case_id": tc["id"],
                    "name": tc["name"],
                    "description": tc["description"],
                    "expected_status": expected_status,
                    "actual_status": actual_status,
                    "passed": passed
                })

            except Exception as e:
                update_test_case_result(tc["id"], None, False)
                results.append({
                    "test_case_id": tc["id"],
                    "name": tc["name"],
                    "description": tc["description"],
                    "expected_status": tc.get("expected_status"),
                    "actual_status": None,
                    "passed": False,
                    "error": str(e)
                })

    passed_count = sum(1 for r in results if r["passed"])
    return {
        "test_run_id": test_run_id,
        "total": len(results),
        "passed": passed_count,
        "failed": len(results) - passed_count,
        "results": results
    }