from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from models.users import User
from models.users import RoleType
import os

load_dotenv()

#hashing password using bcrypt algorithm
pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")
Secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")
access_token = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

#hashing the password and limiting the length to 72 characters to prevent bcrypt truncation
def hash_password(password:str):
    return pwd_context.hash(password[:72])

#verifying the password by comparing the user password with the hashed password
def verify_password(plain_pass: str, hashed_pass: str):
    return pwd_context.verify(plain_pass, hashed_pass)

#creating access token using jwt token with exp time
def create_access_token(token: dict):
    payload = token.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes = access_token)
    payload.update({"exp": expire})
    return jwt.encode(payload, Secret_key, algorithm=algorithm)

#getting current user from the token and verifying the token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try: 
        payload = jwt.decode(token, Secret_key, algorithms=[algorithm])
        email = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await User.find_one(User.email == email)
    if not user:
        raise credentials_exception
    return user

#getting current admin user from the token and verifying the token and checking if the user is admin
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleType.admin:
        raise HTTPException(status_code = 403, detail = "Admin access required")
    return current_user