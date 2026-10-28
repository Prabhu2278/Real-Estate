from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

property_amenities = Table(
    "property_amenities",
    Base.metadata,
    Column("property_id", Integer, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)

    properties = relationship("Property", secondary=property_amenities, back_populates="amenities")
