from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone, timedelta
import uuid
from models.qr import Code, BlockType
from models.users import User
from utils.security import get_current_admin



from dotenv import load_dotenv
import os

load_dotenv()
exp_code = int(os.getenv("EXP_CODE", "5"))
router = APIRouter()

@router.post("/generate/{block}")
async def generate_code(block: BlockType, admin: User = Depends(get_current_admin)):

    now = datetime.now(timezone.utc)

    #checking if there is an existing code for the block that is still valid
    existing_code = await Code.find_one(
        Code.block == block,
        Code.created_at >= now - timedelta(minutes = exp_code),
    )

    if existing_code:
        return {"block": block, "code": existing_code.code, "message": "Existing qrcode is still valid"}
    
    #generating new code
    new_code = f"{block.value}--{(uuid.uuid4()).hex[:8]}"

    qr_code = Code(code = new_code, block = block) 
    await qr_code.insert()
    return {"block": block, "code": new_code, "message": "New qrcode generated successfully", "expiresIn": exp_code * 60}

@router.get("/blocks")
async def get_block():
    return{
        "block": [block.value for block in BlockType]
    }