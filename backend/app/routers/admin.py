from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_admin
from app.models.user import User
from app.models.property import Property
from app.models.enquiry import Enquiry
from app.models.visit import PropertyVisit
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse, PropertyRejection
from app.schemas.common import MessageResponse
from app.crud.crud_user import get_users, count_users, get_user_by_id
from app.crud.crud_property import get_properties, get_property_by_id

router = APIRouter(prefix="/admin", tags=["Administrator"])

@router.get("/dashboard")
def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_properties = db.query(Property).count()
    pending_approvals = db.query(Property).filter(Property.status == "pending").count()
    total_enquiries = db.query(Enquiry).count()
    total_visits = db.query(PropertyVisit).count()

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    pending_properties = db.query(Property).filter(Property.status == "pending").order_by(Property.created_at.desc()).limit(10).all()
    recent_properties = db.query(Property).order_by(Property.created_at.desc()).limit(5).all()

    return {
        "stats": {
            "total_users": total_users,
            "total_properties": total_properties,
            "pending_approvals": pending_approvals,
            "total_enquiries": total_enquiries,
            "total_visits": total_visits
        },
        "recent_users": [UserResponse.model_validate(u) for u in recent_users],
        "pending_properties": [PropertyResponse.model_validate(p) for p in pending_properties],
        "recent_properties": [PropertyResponse.model_validate(p) for p in recent_properties]
    }

@router.get("/users", response_model=List[UserResponse])
def list_admin_users(
    role: Optional[str] = Query(None, description="Filter by role: customer, owner, admin"),
    search: Optional[str] = Query(None, description="Search name or email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = get_users(db, skip=skip, limit=limit, role=role, search=search)
    return [UserResponse.model_validate(u) for u in users]

@router.patch("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrative account")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

@router.get("/properties/pending", response_model=List[PropertyResponse])
def get_pending_properties(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    pending = db.query(Property).filter(Property.status == "pending").order_by(Property.created_at.desc()).all()
    return [PropertyResponse.model_validate(p) for p in pending]

@router.patch("/properties/{property_id}/approve", response_model=PropertyResponse)
def approve_property(
    property_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop.status = "active"
    prop.rejection_reason = None
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)

@router.patch("/properties/{property_id}/reject", response_model=PropertyResponse)
def reject_property(
    property_id: int,
    rejection: PropertyRejection,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop.status = "rejected"
    prop.rejection_reason = rejection.reason.strip()
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)

@router.get("/properties", response_model=List[PropertyResponse])
def get_all_admin_properties(
    status: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    if status and status != "all":
        query = query.filter(Property.status == status)
    props = query.order_by(Property.created_at.desc()).all()
    return [PropertyResponse.model_validate(p) for p in props]
