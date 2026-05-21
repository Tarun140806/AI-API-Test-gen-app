from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Dummy API", description="A dummy API for testing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    name: str
    job: str

@app.post("/api/users", status_code=201)
def create_user(user: User, authorization: Optional[str] = Header(None)):
    if not authorization or authorization != "Bearer validtoken":
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not user.name or not user.job:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Missing fields")
    if len(user.name) > 50:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Name too long")
    return {"id": 1, "name": user.name, "job": user.job}