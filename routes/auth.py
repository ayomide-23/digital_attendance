from fastapi import APIRouter, HTTPException
from models.users import User, BlockType, RoleType
from utils.security import hash_password, verify_password, create_access_token
from schema.auth import RegisterRequest, LoginRequest
from utils.security import  get_current_admin, get_current_user
from fastapi import Depends, Response

router = APIRouter()

#api for user registration
@router.post("/register")
async def register(request: RegisterRequest, response:Response):
    #checking if user already exists
    existing_user  = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(status_code = 400, detail= "User already exists")
    #hashing password
    hashedpassword = hash_password(request.password)
    #creating user
    user = User(
        fname = request.fname,
        lname = request.lname,
        email = request.email,
        password = hashedpassword,
        staff_id = request.staff_id,
        block = BlockType(request.block),
        role = RoleType(request.role)
    )
    await user.insert()
    #creating access token
    token = create_access_token({
        "user_id": str(user.id),
        "role": RoleType(user.role),
        "email": user.email
    })
    #setting a cookie parser
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,   
        secure=False,    
        samesite="lax"
    )
    return {"message": "User registered successfully", "role": user.role}

#api for user login
@router.post("/login")
async def login(request: LoginRequest, response: Response):
    #checking if email exists
    existing_user = await User.find_one(User.email == request.email)
    if not existing_user:
        raise HTTPException(status_code = 400, detail = "Email does not exist")
    #verifying password
    if not verify_password(request.password, existing_user.password):
        raise HTTPException(status_code = 400, detail = "Incorrect password")
    
    #creating token 
    token = create_access_token({"user_id": str(existing_user.id), "email": existing_user.email, "role": existing_user.role})
    #setting a cookie parser
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {
        "access_token" : token,
        "token_type": "bearer",
        "role": existing_user.role,
        "mesage": "User logged in successfully"
    }
 

@router.post("/generate_qr")
async def generate_qr(admin: User = Depends(get_current_admin)):
    return {"message": "QR code generated successfully"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return{
        "role": RoleType(current_user.role),
        "email": current_user.email,
        "staff_id": current_user.staff_id
    }
