from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_owner
from app.models.user import User
from app.schemas.visit import VisitCreate, VisitStatusUpdate, VisitResponse
from app.schemas.common import MessageResponse
from app.crud.crud_visit import (
    get_visit_by_id, create_visit, get_user_visits,
    get_owner_visits, update_visit_status, delete_visit
)
from app.crud.crud_property import get_property_by_id

router = APIRouter(prefix="/visits", tags=["Visits"])

@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def schedule_visit(
    visit_in: VisitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, visit_in.property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    if prop.availability_status not in ["available", "rent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This property is no longer available for visits"
        )
        
    visit = create_visit(db, visit_in, current_user.id)
    return VisitResponse.model_validate(visit)

@router.get("/my", response_model=List[VisitResponse])
def list_my_visits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    visits = get_user_visits(db, current_user.id)
    return [VisitResponse.model_validate(v) for v in visits]

@router.get("/owner", response_model=List[VisitResponse])
def list_owner_visits(
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    visits = get_owner_visits(db, current_user.id)
    return [VisitResponse.model_validate(v) for v in visits]

@router.patch("/{visit_id}", response_model=VisitResponse)
def update_visit(
    visit_id: int,
    status_update: VisitStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit request not found")
        
    # Check permissions: owner of property, or customer who requested (if cancelling), or admin
    is_owner = (visit.property.owner_id == current_user.id)
    is_requester = (visit.user_id == current_user.id)
    is_admin = (current_user.role == "admin")
    
    if not (is_owner or is_admin or (is_requester and status_update.status == "cancelled")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this visit"
        )
        
    updated = update_visit_status(
        db,
        visit,
        status=status_update.status,
        owner_response=status_update.owner_response
    )
    return VisitResponse.model_validate(updated)

@router.delete("/{visit_id}", response_model=MessageResponse)
def cancel_visit(
    visit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit request not found")
        
    if visit.user_id != current_user.id and visit.property.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this visit"
        )
        
    delete_visit(db, visit)
    return MessageResponse(message="Visit cancelled successfully")
