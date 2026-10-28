from typing import Optional
from decimal import Decimal
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user_optional, get_current_owner
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.crud.crud_property import (
    get_property_by_id, get_properties, create_property,
    update_property, delete_property
)
from app.crud.crud_favorite import is_property_favorited

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.get("", response_model=PaginatedResponse[PropertyResponse])
def list_properties(
    search: Optional[str] = Query(None, description="Search keyword in title, address, description"),
    city: Optional[str] = Query(None, description="Filter by city"),
    listing_type: Optional[str] = Query(None, description="Filter by 'rent' or 'buy'/'sale'"),
    property_type: Optional[str] = Query(None, description="Filter by property type"),
    min_price: Optional[Decimal] = Query(None, description="Minimum price"),
    max_price: Optional[Decimal] = Query(None, description="Maximum price"),
    bedrooms: Optional[int] = Query(None, description="Minimum number of bedrooms"),
    bathrooms: Optional[int] = Query(None, description="Minimum number of bathrooms"),
    furnishing_status: Optional[str] = Query(None, description="Furnished, Semi-furnished, Unfurnished"),
    status: Optional[str] = Query("active", description="Status filter, default 'active'"),
    sort_by: Optional[str] = Query("newest", description="Sort by newest, price_asc, price_desc, bedrooms_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    skip = (page - 1) * page_size
    items, total = get_properties(
        db=db,
        skip=skip,
        limit=page_size,
        search=search,
        city=city,
        listing_type=listing_type,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        furnishing_status=furnishing_status,
        status=status,
        sort_by=sort_by
    )
    
    # Enrich with is_favorite for logged-in user
    response_items = []
    for prop in items:
        p_resp = PropertyResponse.model_validate(prop)
        if current_user:
            p_resp.is_favorite = is_property_favorited(db, current_user.id, prop.id)
        response_items.append(p_resp)
        
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property_detail(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    prop = get_property_by_id(db, property_id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} was not found"
        )
    
    # If not active, only owner or admin can view
    if prop.status != "active":
        if not current_user or (current_user.id != prop.owner_id and current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property with ID {property_id} is pending review or inactive"
            )

    resp = PropertyResponse.model_validate(prop)
    if current_user:
        resp.is_favorite = is_property_favorited(db, current_user.id, prop.id)
    return resp

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def add_new_property(
    property_in: PropertyCreate,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    # Admins can auto-approve; owners submit with status 'pending'
    auto_approve = (current_user.role == "admin")
    prop = create_property(db, property_in, owner_id=current_user.id, auto_approve=auto_approve)
    return PropertyResponse.model_validate(prop)

@router.patch("/{property_id}", response_model=PropertyResponse)
def update_existing_property(
    property_id: int,
    property_in: PropertyUpdate,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    # Ownership permission check
    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this property listing"
        )
        
    updated = update_property(db, prop, property_in)
    return PropertyResponse.model_validate(updated)

@router.delete("/{property_id}", response_model=MessageResponse)
def delete_existing_property(
    property_id: int,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this property listing"
        )
        
    delete_property(db, prop)
    return MessageResponse(message="Property listing successfully deleted")
