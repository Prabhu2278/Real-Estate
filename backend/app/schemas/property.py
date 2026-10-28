from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class AmenityResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PropertyImageResponse(BaseModel):
    id: int
    property_id: int
    image_url: str
    is_primary: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OwnerSummary(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PropertyBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    property_type: str = Field(..., pattern="^(Apartment|House|Villa|Studio|Commercial|Office Space)$")
    listing_type: str = Field(..., pattern="^(rent|buy|sale)$")
    price: Decimal = Field(..., gt=0)
    bedrooms: int = Field(1, ge=0)
    bathrooms: int = Field(1, ge=0)
    area_sqft: Decimal = Field(..., gt=0)
    furnishing_status: str = Field("Semi-furnished", pattern="^(Furnished|Semi-furnished|Unfurnished)$")
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    address: str = Field(..., min_length=3)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    postal_code: str = Field(..., min_length=3)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PropertyCreate(PropertyBase):
    amenity_ids: Optional[List[int]] = []
    amenity_names: Optional[List[str]] = []
    image_urls: Optional[List[str]] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    listing_type: Optional[str] = None
    price: Optional[Decimal] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[Decimal] = None
    furnishing_status: Optional[str] = None
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    availability_status: Optional[str] = None
    amenity_ids: Optional[List[int]] = None
    image_urls: Optional[List[str]] = None

class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    status: str
    availability_status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    images: List[PropertyImageResponse] = []
    amenities: List[AmenityResponse] = []
    owner: Optional[OwnerSummary] = None
    is_favorite: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class PropertyRejection(BaseModel):
    reason: str = Field(..., min_length=3)
