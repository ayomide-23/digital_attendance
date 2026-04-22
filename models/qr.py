from beanie import Document
from datetime import datetime, timezone
from enum import Enum
from pydantic import Field

class BlockType(str, Enum):
    A: str = "A"
    B: str = "B"
    C: str = "C"

class Code(Document):
    code:str
    created_at: datetime = Field(default_factory = lambda: datetime.now(timezone.utc))
    block: BlockType

    class Settings:
        name = "codes"
