from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.property import PropertyResponse

class FavoriteCreate(BaseModel):
    property_id: int

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    created_at: datetime
    property: Optional[PropertyResponse] = None

    model_config = ConfigDict(from_attributes=True)
