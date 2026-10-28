from typing import Optional, List, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.property import Property, PropertyImage
from app.models.amenity import Amenity
from app.schemas.property import PropertyCreate, PropertyUpdate

def get_or_create_amenity(db: Session, name: str) -> Amenity:
    cleaned = name.strip()
    amenity = db.query(Amenity).filter(Amenity.name.ilike(cleaned)).first()
    if not amenity:
        amenity = Amenity(name=cleaned)
        db.add(amenity)
        db.commit()
        db.refresh(amenity)
    return amenity

def get_property_by_id(db: Session, property_id: int) -> Optional[Property]:
    return db.query(Property).filter(Property.id == property_id).first()

def get_properties(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    city: Optional[str] = None,
    listing_type: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    furnishing_status: Optional[str] = None,
    status: Optional[str] = "active",
    owner_id: Optional[int] = None,
    sort_by: Optional[str] = "newest",
) -> Tuple[List[Property], int]:
    query = db.query(Property)
    
    if status is not None and status != "all":
        query = query.filter(Property.status == status)
        
    if owner_id is not None:
        query = query.filter(Property.owner_id == owner_id)
        
    if listing_type:
        # Support rent / buy or sale
        if listing_type.lower() in ["buy", "sale"]:
            query = query.filter(Property.listing_type.in_(["buy", "sale"]))
        else:
            query = query.filter(Property.listing_type.ilike(listing_type))
            
    if property_type:
        query = query.filter(Property.property_type.ilike(property_type))
        
    if furnishing_status:
        query = query.filter(Property.furnishing_status.ilike(furnishing_status))
        
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
        
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
        
    if bedrooms is not None and bedrooms > 0:
        query = query.filter(Property.bedrooms >= bedrooms)
        
    if bathrooms is not None and bathrooms > 0:
        query = query.filter(Property.bathrooms >= bathrooms)
        
    if city:
        query = query.filter(Property.city.ilike(f"%{city.strip()}%"))
        
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Property.title.ilike(search_filter),
                Property.description.ilike(search_filter),
                Property.address.ilike(search_filter),
                Property.city.ilike(search_filter),
                Property.state.ilike(search_filter),
                Property.property_type.ilike(search_filter)
            )
        )
        
    total = query.count()
    
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Property.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Property.price))
    elif sort_by == "bedrooms_desc":
        query = query.order_by(desc(Property.bedrooms))
    elif sort_by == "area_desc":
        query = query.order_by(desc(Property.area_sqft))
    elif sort_by == "oldest":
        query = query.order_by(asc(Property.created_at))
    else:  # newest
        query = query.order_by(desc(Property.created_at))
        
    items = query.offset(skip).limit(limit).all()
    return items, total

def create_property(db: Session, property_in: PropertyCreate, owner_id: int, auto_approve: bool = False) -> Property:
    db_property = Property(
        owner_id=owner_id,
        title=property_in.title.strip(),
        description=property_in.description.strip(),
        property_type=property_in.property_type,
        listing_type=property_in.listing_type.lower(),
        price=property_in.price,
        bedrooms=property_in.bedrooms,
        bathrooms=property_in.bathrooms,
        area_sqft=property_in.area_sqft,
        furnishing_status=property_in.furnishing_status,
        floor_number=property_in.floor_number,
        total_floors=property_in.total_floors,
        address=property_in.address.strip(),
        city=property_in.city.strip(),
        state=property_in.state.strip(),
        postal_code=property_in.postal_code.strip(),
        latitude=property_in.latitude,
        longitude=property_in.longitude,
        status="active" if auto_approve else "pending",
        availability_status="available"
    )
    
    # Process amenities
    amenity_objs = []
    if property_in.amenity_ids:
        amenity_objs = db.query(Amenity).filter(Amenity.id.in_(property_in.amenity_ids)).all()
    if property_in.amenity_names:
        for name in property_in.amenity_names:
            if name.strip():
                amenity_objs.append(get_or_create_amenity(db, name))
    db_property.amenities = list(set(amenity_objs))
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    # Process images
    if property_in.image_urls:
        for i, url in enumerate(property_in.image_urls):
            img = PropertyImage(
                property_id=db_property.id,
                image_url=url.strip(),
                is_primary=(i == 0)
            )
            db.add(img)
        db.commit()
        db.refresh(db_property)
        
    return db_property

def update_property(db: Session, db_property: Property, property_in: PropertyUpdate) -> Property:
    update_data = property_in.model_dump(exclude_unset=True)
    
    amenity_ids = update_data.pop("amenity_ids", None)
    image_urls = update_data.pop("image_urls", None)
    
    for field, value in update_data.items():
        if value is not None:
            setattr(db_property, field, value)
            
    if amenity_ids is not None:
        db_property.amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        
    if image_urls is not None:
        db.query(PropertyImage).filter(PropertyImage.property_id == db_property.id).delete()
        for i, url in enumerate(image_urls):
            img = PropertyImage(
                property_id=db_property.id,
                image_url=url.strip(),
                is_primary=(i == 0)
            )
            db.add(img)
            
    db.commit()
    db.refresh(db_property)
    return db_property

def delete_property(db: Session, db_property: Property) -> None:
    db.delete(db_property)
    db.commit()
