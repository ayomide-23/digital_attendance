from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from  dotenv import load_dotenv
from models.users import User
from models.attendance import Attendance
from models.qr import Code

load_dotenv()
Mongo_url = os.getenv("MONGO_URL")
DB_Name = os.getenv("DB_NAME")

client = AsyncIOMotorClient(Mongo_url)
db = client[DB_Name]

async def init_db():
    await init_beanie(database=db, document_models=[User, Attendance, Code])