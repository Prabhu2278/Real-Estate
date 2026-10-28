from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse

class EnquiryCreate(BaseModel):
    property_id: int
    message: str = Field(..., min_length=5, max_length=1000)

class EnquiryReply(BaseModel):
    reply: str = Field(..., min_length=2)
    status: Optional[str] = "replied"

class EnquiryResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    message: str
    status: str
    owner_reply: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None

    model_config = ConfigDict(from_attributes=True)
