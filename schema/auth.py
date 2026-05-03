from pydantic import BaseModel

class RegisterRequest(BaseModel):
    fname: str
    lname: str
    email: str
    password: str
    staff_id: str
    block: str
    role : str

class LoginRequest(BaseModel):
    email: str
    password: str