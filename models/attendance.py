from beanie import Document
from datetime import datetime, timezone
from enum import Enum
from models.users import BlockType
from pydantic import Field


class AttendanceType(str, Enum):
    check_in = "check in"
    check_out = "check out"

class Attendance(Document):
    staff_id: str
    block: BlockType
    type: AttendanceType
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "attendance"
        