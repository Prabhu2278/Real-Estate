from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_owner
from app.models.user import User
from app.models.property import Property
from app.schemas.property import PropertyResponse
from app.schemas.enquiry import EnquiryResponse
from app.schemas.visit import VisitResponse
from app.crud.crud_property import get_properties
from app.crud.crud_enquiry import get_owner_enquiries, count_owner_enquiries
from app.crud.crud_visit import get_owner_visits, count_owner_visits

router = APIRouter(prefix="/owner", tags=["Owner"])

@router.get("/dashboard")
def get_owner_dashboard(
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    total_props = db.query(Property).filter(Property.owner_id == current_user.id).count()
    active_props = db.query(Property).filter(Property.owner_id == current_user.id, Property.status == "active").count()
    pending_props = db.query(Property).filter(Property.owner_id == current_user.id, Property.status == "pending").count()
    total_enquiries = count_owner_enquiries(db, current_user.id)
    upcoming_visits = count_owner_visits(db, current_user.id)

    recent_properties, _ = get_properties(
        db,
        owner_id=current_user.id,
        status="all",
        limit=5
    )
    recent_enquiries = get_owner_enquiries(db, current_user.id)[:5]
    upcoming_visits_list = get_owner_visits(db, current_user.id)[:5]

    return {
        "stats": {
            "total_properties": total_props,
            "active_listings": active_props,
            "pending_approvals": pending_props,
            "total_enquiries": total_enquiries,
            "upcoming_visits": upcoming_visits
        },
        "recent_properties": [PropertyResponse.model_validate(p) for p in recent_properties],
        "recent_enquiries": [EnquiryResponse.model_validate(e) for e in recent_enquiries],
        "upcoming_visits": [VisitResponse.model_validate(v) for v in upcoming_visits_list]
    }

@router.get("/properties", response_model=List[PropertyResponse])
def get_owner_properties(
    status: Optional[str] = Query(None, description="Filter by status: pending, active, rejected, inactive"),
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    query = db.query(Property).filter(Property.owner_id == current_user.id)
    if status and status != "all":
        query = query.filter(Property.status == status)
    props = query.order_by(Property.created_at.desc()).all()
    return [PropertyResponse.model_validate(p) for p in props]
