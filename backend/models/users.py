from beanie import Document
from datetime import datetime
from pymongo import IndexModel
from pydantic import EmailStr
from enum import Enum


class BlockType(str, Enum):
    A: str = "A"
    B: str = "B"
    C: str = "C"

class RoleType(str, Enum):
    admin = "admin"
    user = "user"

class User(Document):
    fname: str
    lname: str
    email:EmailStr
    password: str
    staff_id: str
    block: BlockType
    role: RoleType = RoleType.user
    created_at: datetime = datetime.now()

    class Settings:
        name = "users"
        indexes = [
            IndexModel("staff_id", unique=True)
        ]