import logging
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.amenity import Amenity
from app.models.property import Property, PropertyImage
from app.models.favorite import Favorite
from app.models.enquiry import Enquiry
from app.models.visit import PropertyVisit
from app.core.security import hash_password

logger = logging.getLogger("uvicorn.error")

def seed_database(db: Session) -> None:
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@realestate.com").first():
        logger.info("Database already seeded. Skipping initial seed.")
        return

    logger.info("Seeding database with realistic initial data...")

    # 1. Create Users
    admin_user = User(
        full_name="Platform Administrator",
        email="admin@realestate.com",
        password_hash=hash_password("admin123"),
        phone="+91 99000 00001",
        role="admin",
        is_active=True,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
    )
    owner_user = User(
        full_name="Rajneesh Kumar",
        email="ramesh@example.com",
        password_hash=hash_password("owner123"),
        phone="+91 98765 43210",
        role="owner",
        is_active=True,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
    )
    customer_user = User(
        full_name="Priya Sharma",
        email="priya@example.com",
        password_hash=hash_password("customer123"),
        phone="+91 98450 12345",
        role="customer",
        is_active=True,
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
    )

    db.add_all([admin_user, owner_user, customer_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(owner_user)
    db.refresh(customer_user)

    # 2. Create Amenities
    amenity_names = [
        "Parking", "Lift", "Security", "Gym", "Swimming Pool",
        "Power Backup", "Garden", "Wi-Fi", "Clubhouse", "Water Supply"
    ]
    amenity_objs = {}
    for name in amenity_names:
        amenity = Amenity(name=name)
        db.add(amenity)
        amenity_objs[name] = amenity
    db.commit()

    # 3. Create Properties matching reference design
    properties_data = [
        {
            "title": "2 BHK Apartment",
            "description": "Beautiful 2 BHK apartment in a prime location. Spacious living room, modern kitchen, and excellent amenities. Close to schools, hospitals and shopping centers.",
            "property_type": "Apartment",
            "listing_type": "rent",
            "price": Decimal("18000.00"),
            "bedrooms": 2,
            "bathrooms": 2,
            "area_sqft": Decimal("1050.00"),
            "furnishing_status": "Semi-furnished",
            "floor_number": 3,
            "total_floors": 8,
            "address": "14 Gandhi Road, Velachery",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600042",
            "latitude": 12.9759,
            "longitude": 80.2212,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Lift", "Security", "Gym", "Swimming Pool", "Water Supply"],
            "images": [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "3 BHK Apartment",
            "description": "Luxurious 3 BHK flat with premium woodwork and modular kitchen in central T. Nagar. Dedicated covered car parking and 24/7 security.",
            "property_type": "Apartment",
            "listing_type": "rent",
            "price": Decimal("25000.00"),
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sqft": Decimal("1450.00"),
            "furnishing_status": "Furnished",
            "floor_number": 2,
            "total_floors": 5,
            "address": "45 Usman Road, T. Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600017",
            "latitude": 13.0418,
            "longitude": 80.2341,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Lift", "Security", "Power Backup", "Wi-Fi"],
            "images": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1502005229762-ee1b2b814690?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "3 BHK Villa",
            "description": "Serene coastal villa located along East Coast Road. Features landscaped private garden, contemporary architectural aesthetics, and private access to beach walkway.",
            "property_type": "Villa",
            "listing_type": "rent",
            "price": Decimal("60000.00"),
            "bedrooms": 3,
            "bathrooms": 3,
            "area_sqft": Decimal("2800.00"),
            "furnishing_status": "Furnished",
            "floor_number": 1,
            "total_floors": 2,
            "address": "88 Beachside Boulevard, ECR",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600041",
            "latitude": 12.9249,
            "longitude": 80.2582,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Security", "Swimming Pool", "Garden", "Clubhouse"],
            "images": [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "2 BHK House",
            "description": "Independent residential house with private terrace and quiet neighborhood in Adyar. Ample sunlight and natural ventilation.",
            "property_type": "House",
            "listing_type": "rent",
            "price": Decimal("15000.00"),
            "bedrooms": 2,
            "bathrooms": 2,
            "area_sqft": Decimal("1200.00"),
            "furnishing_status": "Unfurnished",
            "floor_number": 1,
            "total_floors": 2,
            "address": "22 LB Road, Adyar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600020",
            "latitude": 13.0012,
            "longitude": 80.2565,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Water Supply", "Power Backup"],
            "images": [
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "Luxury Villa",
            "description": "Grand 4 BHK designer mansion with private infinity pool, sprawling Italian marble interiors, home theatre, and manicured lawns.",
            "property_type": "Villa",
            "listing_type": "rent",
            "price": Decimal("120000.00"),
            "bedrooms": 4,
            "bathrooms": 4,
            "area_sqft": Decimal("3500.00"),
            "furnishing_status": "Furnished",
            "floor_number": 1,
            "total_floors": 2,
            "address": "10 Golden Palms, ECR",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600041",
            "latitude": 12.8711,
            "longitude": 80.2412,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Security", "Swimming Pool", "Gym", "Garden", "Clubhouse", "Wi-Fi"],
            "images": [
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "Commercial Space",
            "description": "Prime commercial office space suited for software development teams, boutique consultancy or financial services in commercial Anna Nagar hub.",
            "property_type": "Commercial",
            "listing_type": "rent",
            "price": Decimal("45000.00"),
            "bedrooms": 0,
            "bathrooms": 2,
            "area_sqft": Decimal("1200.00"),
            "furnishing_status": "Furnished",
            "floor_number": 2,
            "total_floors": 4,
            "address": "2nd Avenue, Anna Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600040",
            "latitude": 13.0850,
            "longitude": 80.2101,
            "status": "pending",
            "availability_status": "available",
            "amenities": ["Lift", "Security", "Power Backup", "Wi-Fi"],
            "images": [
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "1 BHK Apartment",
            "description": "Cozy and convenient 1 BHK flat near Pondy Bazaar. Ideal for single working professionals or couples.",
            "property_type": "Apartment",
            "listing_type": "rent",
            "price": Decimal("12000.00"),
            "bedrooms": 1,
            "bathrooms": 1,
            "area_sqft": Decimal("650.00"),
            "furnishing_status": "Semi-furnished",
            "floor_number": 1,
            "total_floors": 4,
            "address": "12 Thanikachalam Road, T. Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600017",
            "latitude": 13.0382,
            "longitude": 80.2319,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Water Supply", "Security"],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "Modern Studio Apartment",
            "description": "High tech studio with open concept layout, smart home automations and balcony overlooking greenery in Velachery.",
            "property_type": "Studio",
            "listing_type": "rent",
            "price": Decimal("14000.00"),
            "bedrooms": 1,
            "bathrooms": 1,
            "area_sqft": Decimal("550.00"),
            "furnishing_status": "Furnished",
            "floor_number": 4,
            "total_floors": 6,
            "address": "30 Bypass Road, Velachery",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600042",
            "latitude": 12.9810,
            "longitude": 80.2180,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Lift", "Security", "Power Backup", "Gym", "Wi-Fi"],
            "images": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "Premium 3 BHK Gated Villa",
            "description": "For sale: Elegantly finished 3 BHK independent duplex villa inside a secured gated community with club amenities in OMR IT corridor.",
            "property_type": "Villa",
            "listing_type": "buy",
            "price": Decimal("11500000.00"),
            "bedrooms": 3,
            "bathrooms": 3,
            "area_sqft": Decimal("2100.00"),
            "furnishing_status": "Semi-furnished",
            "floor_number": 1,
            "total_floors": 2,
            "address": "55 Rajiv Gandhi Salai, OMR",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "600097",
            "latitude": 12.9150,
            "longitude": 80.2300,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Security", "Swimming Pool", "Gym", "Garden", "Clubhouse"],
            "images": [
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1000&auto=format&fit=crop&q=80"
            ]
        },
        {
            "title": "Seafront Luxury Villa",
            "description": "For sale: Unmatched ultra luxury beachfront villa with panoramic Bay of Bengal views, private swimming pool, and Italian modular fittings.",
            "property_type": "Villa",
            "listing_type": "buy",
            "price": Decimal("38000000.00"),
            "bedrooms": 5,
            "bathrooms": 5,
            "area_sqft": Decimal("4600.00"),
            "furnishing_status": "Furnished",
            "floor_number": 1,
            "total_floors": 3,
            "address": "1 Seaside Crescent, Kovalam, ECR",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "postal_code": "603112",
            "latitude": 12.7915,
            "longitude": 80.2514,
            "status": "active",
            "availability_status": "available",
            "amenities": ["Parking", "Security", "Swimming Pool", "Gym", "Garden", "Wi-Fi", "Clubhouse"],
            "images": [
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&auto=format&fit=crop&q=80"
            ]
        }
    ]

    created_properties = []
    for pdata in properties_data:
        prop = Property(
            owner_id=owner_user.id,
            title=pdata["title"],
            description=pdata["description"],
            property_type=pdata["property_type"],
            listing_type=pdata["listing_type"],
            price=pdata["price"],
            bedrooms=pdata["bedrooms"],
            bathrooms=pdata["bathrooms"],
            area_sqft=pdata["area_sqft"],
            furnishing_status=pdata["furnishing_status"],
            floor_number=pdata.get("floor_number"),
            total_floors=pdata.get("total_floors"),
            address=pdata["address"],
            city=pdata["city"],
            state=pdata["state"],
            postal_code=pdata["postal_code"],
            latitude=pdata.get("latitude"),
            longitude=pdata.get("longitude"),
            status=pdata["status"],
            availability_status=pdata["availability_status"]
        )
        prop.amenities = [amenity_objs[name] for name in pdata["amenities"] if name in amenity_objs]
        db.add(prop)
        db.commit()
        db.refresh(prop)

        # Images
        for i, img_url in enumerate(pdata["images"]):
            p_img = PropertyImage(
                property_id=prop.id,
                image_url=img_url,
                is_primary=(i == 0)
            )
            db.add(p_img)
        db.commit()
        created_properties.append(prop)

    # 4. Create Favorites for Priya (Customer)
    # Save properties 1, 2, 3, 5, 6 (5 favorites matching "Saved Properties (5)")
    for prop in [created_properties[0], created_properties[1], created_properties[2], created_properties[4], created_properties[3]]:
        fav = Favorite(user_id=customer_user.id, property_id=prop.id)
        db.add(fav)
    db.commit()

    # 5. Create Enquiries for Priya (3 enquiries matching "Total Enquiries (3)")
    enquiries_data = [
        {
            "property_id": created_properties[0].id,
            "message": "I'm interested in this property. Is it still available? Can we schedule a visit?",
            "status": "pending"
        },
        {
            "property_id": created_properties[1].id,
            "message": "Hi Rajneesh, does the maintenance charge include water and 24hr power backup?",
            "status": "replied",
            "owner_reply": "Yes Priya, maintenance covers 24/7 security, elevator and full power backup."
        },
        {
            "property_id": created_properties[2].id,
            "message": "Is the rental deposit negotiable for long-term tenancy?",
            "status": "pending"
        }
    ]
    for eq in enquiries_data:
        enq = Enquiry(
            user_id=customer_user.id,
            property_id=eq["property_id"],
            message=eq["message"],
            status=eq["status"],
            owner_reply=eq.get("owner_reply")
        )
        db.add(enq)
    db.commit()

    # 6. Create Visits for Priya (2 visits matching "Upcoming Visits (2)")
    now = datetime.now(timezone.utc)
    visit1 = PropertyVisit(
        user_id=customer_user.id,
        property_id=created_properties[0].id,
        requested_at=now + timedelta(days=2),
        time_slot="10:00 AM",
        status="confirmed",
        customer_message="Would like to inspect the living area and parking slots.",
        owner_response="Confirmed! I will be at the property to show you around."
    )
    visit2 = PropertyVisit(
        user_id=customer_user.id,
        property_id=created_properties[1].id,
        requested_at=now + timedelta(days=4),
        time_slot="02:00 PM",
        status="pending",
        customer_message="Visiting on weekend afternoon."
    )
    db.add_all([visit1, visit2])
    db.commit()

    logger.info("Seed data creation completed successfully!")
