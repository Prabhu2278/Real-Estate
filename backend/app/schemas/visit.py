from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse

class VisitCreate(BaseModel):
    property_id: int
    requested_at: datetime
    time_slot: str = Field(..., pattern="^(0?9:00 AM|10:00 AM|11:00 AM|12:00 PM|0?1:00 PM|0?2:00 PM|0?3:00 PM|0?4:00 PM|0?5:00 PM|0?6:00 PM)$")
    customer_message: Optional[str] = None

class VisitStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(confirmed|rejected|cancelled|completed)$")
    owner_response: Optional[str] = None

class VisitResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    requested_at: datetime
    time_slot: str
    status: str
    customer_message: Optional[str] = None
    owner_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None

    model_config = ConfigDict(from_attributes=True)
