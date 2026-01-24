from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True