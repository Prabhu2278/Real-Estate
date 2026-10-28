from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PropertyVisit(Base):
    __tablename__ = "property_visits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_at = Column(DateTime, nullable=False)
    time_slot = Column(String(50), nullable=False)  # e.g., '10:00 AM', '11:00 AM', etc.
    status = Column(String(30), default="pending", nullable=False)  # 'pending', 'confirmed', 'rejected', 'cancelled', 'completed'
    customer_message = Column(Text, nullable=True)
    owner_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="visits")
    property = relationship("Property", back_populates="visits")
