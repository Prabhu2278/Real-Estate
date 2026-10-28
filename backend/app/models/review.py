from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_review_rating_1_to_5"),
    )

    user = relationship("User", back_populates="reviews")
    property = relationship("Property", back_populates="reviews")
