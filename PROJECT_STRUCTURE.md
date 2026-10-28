# Project Structure

```
Real Estate Platform/
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx                 # Root layout with AuthProvider & Navigation
│   │   ├── index.tsx                   # Page 1: Landing Page (Hero, Search, Featured)
│   │   ├── login.tsx                   # Page 4: Login Page (Split screen with photo hero)
│   │   ├── register.tsx                # Page 5: Registration Page (Customer & Owner roles)
│   │   │
│   │   ├── properties/
│   │   │   ├── index.tsx               # Page 2: Property Listing (Filters, Sort, Grid/List)
│   │   │   └── [id].tsx                # Page 3: Property Details (Gallery, Enquiry, Visits)
│   │   │
│   │   ├── customer/
│   │   │   ├── dashboard.tsx           # Page 6: Customer Dashboard (Saved, Enquiries, Visits)
│   │   │   ├── favorites.tsx           # Page 7: Saved Properties
│   │   │   ├── enquiries.tsx           # Page 8: My Enquiries & Owner replies
│   │   │   ├── visits.tsx              # Page 9: Scheduled Visits & Cancellations
│   │   │   └── profile.tsx             # Page 17: Profile & Password Management
│   │   │
│   │   ├── owner/
│   │   │   ├── dashboard.tsx           # Page 10: Owner Dashboard (Metrics, Listings)
│   │   │   ├── properties.tsx          # Page 11: My Properties (Manage & status toggle)
│   │   │   ├── add-property.tsx        # Page 12: Add Property (4-Step Wizard)
│   │   │   ├── edit-property.tsx       # Page 13: Edit Property Listing
│   │   │   ├── enquiries.tsx           # Owner Enquiries Inbox & Reply form
│   │   │   └── visits.tsx              # Owner Visits Management (Confirm/Decline)
│   │   │
│   │   └── admin/
│   │       ├── dashboard.tsx           # Page 14: Administrator Dashboard Overview
│   │       ├── users.tsx               # Page 16: Manage Users (Search, Role, Active toggle)
│   │       ├── properties.tsx          # All Platform Properties Directory
│   │       ├── approvals.tsx           # Page 15: Property Listing Approvals / Rejections
│   │       └── reports.tsx             # Analytics & Distribution Reports
│   │
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── Navbar.tsx              # Top navigation bar with Logo, links & user profile
│   │   │   └── Sidebar.tsx             # Dark Navy dashboard sidebar
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx        # Property card with specs & heart favorite toggle
│   │   │   ├── PropertyGallery.tsx     # Large photo + thumbnail carousel row
│   │   │   └── FilterPanel.tsx         # Left filter sidebar (Type, BHK, Price, Furnishing)
│   │   ├── dashboard/
│   │   │   └── StatCard.tsx            # Clean summary metrics card
│   │   └── common/
│   │       ├── Modal.tsx               # Reusable dialog for Enquiries & Visits
│   │       ├── StatusBadge.tsx         # Active, Pending, Rejected, Rented badges
│   │       ├── LoadingSpinner.tsx      # Loading state indicator
│   │       └── EmptyState.tsx          # Empty results with action button
│   │
│   ├── services/
│   │   ├── api.ts                      # Axios instance with JWT interceptor & storage
│   │   ├── auth.service.ts             # Login, register, profile, password change
│   │   ├── property.service.ts         # Property CRUD & search queries
│   │   ├── favorites.service.ts        # Favorites management
│   │   ├── enquiry.service.ts          # Customer inquiries & owner responses
│   │   ├── visit.service.ts            # Visit scheduling & status management
│   │   ├── owner.service.ts            # Owner dashboard & property queries
│   │   └── admin.service.ts            # Admin dashboard, approvals & user management
│   │
│   ├── hooks/
│   │   └── useAuth.tsx                 # Authentication Context & Provider
│   ├── constants/
│   │   ├── theme.ts                    # Colors, typography, spacing, shadows
│   │   └── config.ts                   # API URL, time slots, property types
│   ├── types/
│   │   └── index.ts                    # TypeScript types and interfaces
│   ├── utils/
│   │   └── format.ts                   # Price (₹), area (sq ft), and date formatting
│   ├── app.json                        # Expo app configuration
│   ├── package.json                    # Frontend dependencies
│   └── tsconfig.json                   # TypeScript configuration
│
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application & startup lifecycle
│   │   ├── database.py                 # SQLAlchemy engine & fallback connection
│   │   ├── dependencies.py             # Auth & Role-Based Access Control guards
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings
│   │   │   └── security.py             # Bcrypt hashing & PyJWT tokens
│   │   ├── models/                     # SQLAlchemy Models
│   │   │   ├── user.py                 # User model (Customer, Owner, Admin)
│   │   │   ├── property.py             # Property & PropertyImage models
│   │   │   ├── amenity.py              # Amenity & association table
│   │   │   ├── favorite.py             # Favorite model with unique constraint
│   │   │   ├── enquiry.py              # Customer Enquiry model
│   │   │   ├── visit.py                # PropertyVisit model
│   │   │   ├── notification.py         # Notification model
│   │   │   └── review.py               # Review model
│   │   ├── schemas/                    # Pydantic V2 Schemas
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   ├── favorite.py
│   │   │   ├── enquiry.py
│   │   │   ├── visit.py
│   │   │   └── common.py
│   │   ├── crud/                       # Database Operations
│   │   │   ├── crud_user.py
│   │   │   ├── crud_property.py
│   │   │   ├── crud_favorite.py
│   │   │   ├── crud_enquiry.py
│   │   │   └── crud_visit.py
│   │   ├── services/
│   │   │   └── seed_data.py            # Realistic properties & users seed script
│   │   └── routers/                    # REST API Endpoints
│   │       ├── auth.py
│   │       ├── properties.py
│   │       ├── favorites.py
│   │       ├── enquiries.py
│   │       ├── visits.py
│   │       ├── owner.py
│   │       └── admin.py
│   │
│   ├── alembic/                        # Alembic Database Migrations
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── tests/                          # Automated Pytest Suite
│   │   ├── conftest.py
│   │   └── test_api.py                 # 13/13 passing tests
│   ├── requirements.txt                # Python dependencies
│   ├── alembic.ini                     # Migration configuration
│   └── Dockerfile                      # Backend container configuration
│
├── docs/
│   ├── ARCHITECTURE.md                 # System architecture & design
│   ├── API.md                          # REST API endpoint reference
│   ├── DATABASE.md                     # Database ERD & schema documentation
│   └── RealEstate UI_UX Design System Showcase.png # Design showcase reference
│
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── docker-compose.yml                  # Full-stack Docker compose configuration
├── README.md                           # Main documentation & getting started guide
└── PROJECT_STRUCTURE.md                # Project file structure reference
```
