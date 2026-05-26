from fastapi import FastAPI
from db import init_db
from routes.auth import router as auth_router
from routes.attendance import router as attendance_router
from routes.qr import router as qr_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["https://digital-attendance-three.vercel.app"],
    allow_credentials = True,
    allow_methods = ["GET", "POST", "PUT", "DELETE"],
    allow_headers = ["Content-Type", "Authorization"],
)
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("Server is running")

app.include_router(auth_router, prefix = "/auth")
app.include_router(attendance_router, prefix = "/attendance")
app.include_router(qr_router, prefix = "/qr")
