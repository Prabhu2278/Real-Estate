from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="pending", nullable=False)  # 'pending', 'replied', 'closed'
    owner_reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="enquiries")
    property = relationship("Property", back_populates="enquiries")
