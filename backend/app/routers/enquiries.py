from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_owner
from app.models.user import User
from app.schemas.enquiry import EnquiryCreate, EnquiryReply, EnquiryResponse
from app.crud.crud_enquiry import (
    get_enquiry_by_id, create_enquiry, get_user_enquiries,
    get_owner_enquiries, update_enquiry_status
)
from app.crud.crud_property import get_property_by_id

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])

@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_enquiry(
    enquiry_in: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, enquiry_in.property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    enquiry = create_enquiry(db, enquiry_in, current_user.id)
    return EnquiryResponse.model_validate(enquiry)

@router.get("/my", response_model=List[EnquiryResponse])
def list_my_enquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiries = get_user_enquiries(db, current_user.id)
    return [EnquiryResponse.model_validate(e) for e in enquiries]

@router.get("/owner", response_model=List[EnquiryResponse])
def list_owner_enquiries(
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    enquiries = get_owner_enquiries(db, current_user.id)
    return [EnquiryResponse.model_validate(e) for e in enquiries]

@router.patch("/{enquiry_id}", response_model=EnquiryResponse)
def respond_to_enquiry(
    enquiry_id: int,
    reply_data: EnquiryReply,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    enquiry = get_enquiry_by_id(db, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")
        
    # Check ownership
    if enquiry.property.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to respond to this enquiry"
        )
        
    updated = update_enquiry_status(db, enquiry, status=reply_data.status or "replied", owner_reply=reply_data.reply)
    return EnquiryResponse.model_validate(updated)
