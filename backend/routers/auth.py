from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from database import users
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    email: str


def _hash(pw: str) -> str:
    return pwd_ctx.hash(pw)


def _verify(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def _create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await users().find_one({"email": email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["_id"] = str(user["_id"])
    return user


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    if await users().find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": body.name,
        "email": body.email,
        "password": _hash(body.password),
        "created_at": datetime.utcnow(),
    }
    await users().insert_one(doc)
    token = _create_token({"sub": body.email})
    return TokenResponse(access_token=token, name=body.name, email=body.email)


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = await users().find_one({"email": form.username})
    if not user or not _verify(form.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _create_token({"sub": user["email"]})
    return TokenResponse(access_token=token, name=user["name"], email=user["email"])


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
