from fastapi import FastAPI
from db import init_db
from routes.auth import router as auth_router
from routes.attendance import router as attendance_router
from routes.qr import router as qr_router

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("Server is running")

app.include_router(auth_router, prefix = "/auth")
app.include_router(attendance_router, prefix = "/attendance")
app.include_router(qr_router, prefix = "/qr")