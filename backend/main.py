from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import GROQ_API_KEY, SUPABASE_URL, SUPABASE_KEY
from routers.generate import router as generate_router

app = FastAPI(
    title="API Test Gen",
    description="Automatically generate and run API test cases using AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(generate_router)

@app.get("/")
def root():
    return {"message": "AI API Test Generator is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

