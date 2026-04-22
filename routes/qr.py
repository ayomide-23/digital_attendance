from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import uuid
from models.qr import Code, BlockType
from dotenv import load_dotenv
import os

load_dotenv()
exp_code = int(os.getenv("EXP_CODE", "5"))
router = APIRouter()

@router.post("/generate/{block}")
async def generate_code(block:BlockType):
    now = datetime.now(timezone.utc)

    #checking if there is an existing code for the block that is still valid
    existing_code = await Code.find_one(
        Code.block == block,
        Code.created_at >= now - timedelta(minutes = exp_code),
    )

    if existing_code:
        return {"block": block, "code": existing_code.code, "message": "Existing code is still valid"}
    
    #generating new code
    new_code = f"{block}--{str(uuid.uuid4()).hex[:8]}"

    qr_code = Code(code = new_code, block = block) 
    await qr_code.insert()
    return {"block": block, "code": new_code, "message": "New code generated successfully"}