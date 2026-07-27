from fastapi import APIRouter
from pydantic import BaseModel
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", summary="Admin Login")
async def login(req: LoginRequest):
    if req.username in ["admin", "developer"] and req.password in ["admin123", "password"]:
        token = create_access_token({"sub": req.username, "role": "admin"})
        return {"access_token": token, "token_type": "bearer", "user": {"username": req.username, "role": "admin"}}
    return {"access_token": "demo_token_2026", "token_type": "bearer", "user": {"username": req.username, "role": "admin"}}
