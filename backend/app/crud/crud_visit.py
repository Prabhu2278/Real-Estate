from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.visit import PropertyVisit
from app.models.property import Property
from app.schemas.visit import VisitCreate

def get_visit_by_id(db: Session, visit_id: int) -> Optional[PropertyVisit]:
    return db.query(PropertyVisit).filter(PropertyVisit.id == visit_id).first()

def create_visit(db: Session, visit_in: VisitCreate, user_id: int) -> PropertyVisit:
    visit = PropertyVisit(
        user_id=user_id,
        property_id=visit_in.property_id,
        requested_at=visit_in.requested_at,
        time_slot=visit_in.time_slot,
        customer_message=visit_in.customer_message.strip() if visit_in.customer_message else None,
        status="pending"
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit

def get_user_visits(db: Session, user_id: int) -> List[PropertyVisit]:
    return db.query(PropertyVisit).filter(PropertyVisit.user_id == user_id).order_by(PropertyVisit.requested_at.asc()).all()

def get_owner_visits(db: Session, owner_id: int) -> List[PropertyVisit]:
    return (
        db.query(PropertyVisit)
        .join(Property, PropertyVisit.property_id == Property.id)
        .filter(Property.owner_id == owner_id)
        .order_by(PropertyVisit.requested_at.asc())
        .all()
    )

def count_user_visits(db: Session, user_id: int) -> int:
    return db.query(PropertyVisit).filter(PropertyVisit.user_id == user_id).count()

def count_owner_visits(db: Session, owner_id: int) -> int:
    return (
        db.query(PropertyVisit)
        .join(Property, PropertyVisit.property_id == Property.id)
        .filter(Property.owner_id == owner_id)
        .count()
    )

def update_visit_status(db: Session, visit: PropertyVisit, status: str, owner_response: Optional[str] = None) -> PropertyVisit:
    visit.status = status
    if owner_response is not None:
        visit.owner_response = owner_response.strip()
    db.commit()
    db.refresh(visit)
    return visit

def delete_visit(db: Session, visit: PropertyVisit) -> None:
    db.delete(visit)
    db.commit()
