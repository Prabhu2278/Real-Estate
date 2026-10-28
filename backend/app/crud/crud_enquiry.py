from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.enquiry import Enquiry
from app.models.property import Property
from app.schemas.enquiry import EnquiryCreate

def get_enquiry_by_id(db: Session, enquiry_id: int) -> Optional[Enquiry]:
    return db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()

def create_enquiry(db: Session, enquiry_in: EnquiryCreate, user_id: int) -> Enquiry:
    enquiry = Enquiry(
        user_id=user_id,
        property_id=enquiry_in.property_id,
        message=enquiry_in.message.strip(),
        status="pending"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry

def get_user_enquiries(db: Session, user_id: int) -> List[Enquiry]:
    return db.query(Enquiry).filter(Enquiry.user_id == user_id).order_by(Enquiry.created_at.desc()).all()

def get_owner_enquiries(db: Session, owner_id: int) -> List[Enquiry]:
    return (
        db.query(Enquiry)
        .join(Property, Enquiry.property_id == Property.id)
        .filter(Property.owner_id == owner_id)
        .order_by(Enquiry.created_at.desc())
        .all()
    )

def count_user_enquiries(db: Session, user_id: int) -> int:
    return db.query(Enquiry).filter(Enquiry.user_id == user_id).count()

def count_owner_enquiries(db: Session, owner_id: int) -> int:
    return (
        db.query(Enquiry)
        .join(Property, Enquiry.property_id == Property.id)
        .filter(Property.owner_id == owner_id)
        .count()
    )

def update_enquiry_status(db: Session, enquiry: Enquiry, status: str, owner_reply: Optional[str] = None) -> Enquiry:
    enquiry.status = status
    if owner_reply is not None:
        enquiry.owner_reply = owner_reply.strip()
    db.commit()
    db.refresh(enquiry)
    return enquiry
