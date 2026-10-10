from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.db.mongodb import db_manager

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    email: str
    name: str
    created_at: str

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    if db_manager.is_connected:
        user = await db_manager.db.users.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
            return user
    else:
        # Fallback memory check
        user = db_manager.in_memory_users.get(email)
        if user:
            return user

    raise HTTPException(status_code=404, detail="User not found")

async def get_current_user_optional(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))) -> Optional[dict]:
    if not token:
        return None
    try:
        return await get_current_user(token)
    except Exception:
        return None


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister):
    hashed_pwd = get_password_hash(user_in.password)
    created_at = datetime.utcnow().isoformat()
    
    user_dict = {
        "email": user_in.email.lower(),
        "name": user_in.name,
        "hashed_password": hashed_pwd,
        "created_at": created_at
    }

    if db_manager.is_connected:
        existing = await db_manager.db.users.find_one({"email": user_in.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists.")
        await db_manager.db.users.insert_one(user_dict)
    else:
        if user_in.email.lower() in db_manager.in_memory_users:
            raise HTTPException(status_code=400, detail="User with this email already exists.")
        db_manager.in_memory_users[user_in.email.lower()] = user_dict

    token = create_access_token(subject=user_in.email.lower())
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user_in.name,
            "email": user_in.email.lower(),
            "created_at": created_at
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    raw_email = credentials.email.strip().lower()
    
    # Friendly alias mapping
    if raw_email == "admin":
        email = "admin@security.io"
    elif raw_email == "operator":
        email = "operator@security.io"
    else:
        email = raw_email
    
    user = None
    if db_manager.is_connected:
        user = await db_manager.db.users.find_one({"email": email})
    else:
        user = db_manager.in_memory_users.get(email)

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    token = create_access_token(subject=email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user.get("name", "User"),
            "email": email,
            "created_at": user.get("created_at", "")
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "name": current_user["name"],
        "created_at": current_user.get("created_at", "")
    }
