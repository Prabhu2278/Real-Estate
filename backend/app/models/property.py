from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Numeric, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.amenity import property_amenities

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False, index=True)  # 'Apartment', 'House', 'Villa', 'Studio', 'Commercial', 'Office Space'
    listing_type = Column(String(20), nullable=False, index=True)   # 'rent', 'buy' / 'sale'
    
    price = Column(Numeric(14, 2), nullable=False, index=True)
    bedrooms = Column(Integer, default=1, nullable=False, index=True)
    bathrooms = Column(Integer, default=1, nullable=False)
    area_sqft = Column(Numeric(10, 2), nullable=False)
    furnishing_status = Column(String(50), default="Semi-furnished", nullable=False)  # 'Furnished', 'Semi-furnished', 'Unfurnished'
    floor_number = Column(Integer, nullable=True)
    total_floors = Column(Integer, nullable=True)
    
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    status = Column(String(20), default="pending", nullable=False, index=True)  # 'pending', 'active', 'rejected', 'inactive'
    availability_status = Column(String(30), default="available", nullable=False)  # 'available', 'rented', 'sold'
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.is_primary.desc()")
    amenities = relationship("Amenity", secondary=property_amenities, back_populates="properties")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="property", cascade="all, delete-orphan")
    visits = relationship("PropertyVisit", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="property", cascade="all, delete-orphan")

class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    property = relationship("Property", back_populates="images")
