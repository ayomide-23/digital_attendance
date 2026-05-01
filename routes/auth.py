from fastapi import APIRouter, HTTPException
from models.users import User, BlockType
from utils.security import hash_password, verify_password, create_access_token
from schema.auth import RegisterRequest, LoginRequest
from utils.security import  get_current_admin
from fastapi import Depends

router = APIRouter()

#api for user registration
@router.post("/register")
async def register(request: RegisterRequest):
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
        block = BlockType(request.block)
    )
    await user.save()
    return {"message": "User registered successfully"}

#api for user login
@router.post("/login")
async def login(request: LoginRequest):
    #checking if email exists
    existing_user = await User.find_one(User.email == request.email)
    if not existing_user:
        raise HTTPException(status_code = 400, detail = "Email does not exist")
    #verifying password
    if not verify_password(request.password, existing_user.password):
        raise HTTPException(status_code = 400, detail = "Incorrect password")

    #creating token 
    token = create_access_token({"user_id": str(existing_user.id), "email": existing_user.email, "role": existing_user.role})
    return {
        "access_token" : token,
        "token_type": "bearer"
    }

@router.post("/generate_qr")
async def generate_qr(admin: User = Depends(get_current_admin)):
    return {"message": "QR code generated successfully"}
