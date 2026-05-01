from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from models.attendance import Attendance, AttendanceType
from models.qr import Code
from models.users import User
from utils.security import get_current_user
from dotenv import load_dotenv
import os

load_dotenv()
router = APIRouter()
exp_min = int(os.getenv("EXP_CODE", "5"))

class Scanrequest(BaseModel):
    qr_code: str
    attendance_type: AttendanceType

@router.post("/scan")
async def check_attendance(
    scan_request: Scanrequest,
    current_user: User = Depends(get_current_user),
):
    #checking the qr code in the db
    code = await Code.find_one(Code.code == scan_request.qr_code)
    if not code:
        raise HTTPException(status_code = 400, detail = "Invalid QR  code")
    if code.used:
        raise HTTPException(status_code = 400, detail = "QR code has already been used")
    code.used = True
    await code.save()
    
    #checking if the qr code is still valid 
    current_time = datetime.now(timezone.utc)
    if current_time - code.created_at > timedelta(minutes = exp_min):
        raise HTTPException(status_code = 400, detail = "QR Code has expired")
    
    #preventing duplicate attendance records
    existing = await Attendance.find_one(
        Attendance.staff_id == current_user.staff_id,
        Attendance.type == scan_request.attendance_type,
        Attendance.timestamp >= current_time - timedelta(minutes = exp_min),
    )
    if existing:
        raise HTTPException(status_code = 400, detail = f"{scan_request.attendance_type} already recorded recently")
    
    #saving new attendance in the database
    new_record = Attendance(
        staff_id = current_user.staff_id,
        block = current_user.block,
        type = scan_request.attendance_type,
    )
    await new_record.insert()
    return {
        "message": f"{scan_request.attendance_type} recorded successfully",
        "timestamp": new_record.timestamp,
        "block": new_record.block,
        "staff_id": new_record.staff_id,
        "type": scan_request.attendance_type,
    }