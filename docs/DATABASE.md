# Database Schema Documentation

The platform uses PostgreSQL as its primary production relational database with SQLAlchemy 2.0 ORM and Alembic migrations.

---

## Entity Relationship Diagram (ERD)

```
       ┌────────────────────────┐
       │         users          │
       │────────────────────────│
       │ PK id                  │
       │    full_name           │
       │    email (UNIQUE)      │
       │    password_hash       │
       │    phone               │
       │    role                │
       │    is_active           │
       │    avatar_url          │
       │    created_at          │
       │    updated_at          │
       └───────────┬────────────┘
                   │ 1
                   │
                   │ *
       ┌───────────▼────────────┐        ┌─────────────────────────┐
       │       properties       │◄───────┤     property_images     │
       │────────────────────────│ 1    * │─────────────────────────│
       │ PK id                  │        │ PK id                   │
       │ FK owner_id            │        │ FK property_id          │
       │    title               │        │    image_url            │
       │    description         │        │    is_primary           │
       │    property_type       │        │    created_at           │
       │    listing_type        │        └─────────────────────────┘
       │    price (NUMERIC)     │
       │    bedrooms            │        ┌─────────────────────────┐
       │    bathrooms           │◄───────┤    property_amenities   │
       │    area_sqft (NUMERIC) │ *    * │─────────────────────────│
       │    furnishing_status   │        │ PK/FK property_id       │
       │    floor_number        │        │ PK/FK amenity_id        │
       │    total_floors        │        └────────────▲────────────┘
       │    address             │                     │
       │    city                │                     │ *
       │    state               │        ┌────────────┴────────────┐
       │    postal_code         │        │        amenities        │
       │    latitude            │        │─────────────────────────│
       │    longitude           │        │ PK id                   │
       │    status              │        │    name (UNIQUE)        │
       │    availability_status │        │    icon                 │
       │    rejection_reason    │        └─────────────────────────┘
       │    created_at          │
       │    updated_at          │
       └─────┬───────────┬──────┘
             │ 1         │ 1
             │           │
             │ *         │ *
 ┌───────────▼──┐     ┌──▼───────────────────┐     ┌──────────────────────┐
 │  favorites   │     │      enquiries       │     │   property_visits    │
 │──────────────│     │──────────────────────│     │──────────────────────│
 │ PK id        │     │ PK id                │     │ PK id                │
 │ FK user_id   │     │ FK user_id           │     │ FK user_id           │
 │ FK property_id     │ FK property_id       │     │ FK property_id       │
 │    created_at│     │    message           │     │    requested_at      │
 └──────────────┘     │    status            │     │    time_slot         │
                      │    owner_reply       │     │    status            │
                      │    created_at        │     │    customer_message  │
                      │    updated_at        │     │    owner_response    │
                      └──────────────────────┘     │    created_at        │
                                                   │    updated_at        │
                                                   └──────────────────────┘
```

---

## Table Definitions

### 1. `users`
- `id`: `INTEGER`, Primary Key, Auto-increment
- `full_name`: `VARCHAR(100)`, Not Null
- `email`: `VARCHAR(255)`, Not Null, Unique Index
- `password_hash`: `VARCHAR(255)`, Not Null (bcrypt hashed)
- `phone`: `VARCHAR(30)`, Nullable
- `role`: `VARCHAR(20)`, Default `'customer'`, Valid values: `customer`, `owner`, `admin`
- `is_active`: `BOOLEAN`, Default `TRUE`
- `avatar_url`: `VARCHAR(500)`, Nullable
- `created_at`: `DATETIME`, Timestamp
- `updated_at`: `DATETIME`, Timestamp

### 2. `properties`
- `id`: `INTEGER`, Primary Key
- `owner_id`: `INTEGER`, Foreign Key referencing `users(id)` with `ON DELETE CASCADE`
- `title`: `VARCHAR(200)`, Indexed
- `description`: `TEXT`, Not Null
- `property_type`: `VARCHAR(50)`, Indexed (Apartment, House, Villa, Studio, Commercial, Office Space)
- `listing_type`: `VARCHAR(20)`, Indexed (rent, buy)
- `price`: `NUMERIC(14, 2)`, Indexed (decimal-safe currency value)
- `bedrooms`: `INTEGER`, Default 1
- `bathrooms`: `INTEGER`, Default 1
- `area_sqft`: `NUMERIC(10, 2)`, Not Null
- `furnishing_status`: `VARCHAR(50)`, Default `'Semi-furnished'`
- `floor_number`: `INTEGER`, Nullable
- `total_floors`: `INTEGER`, Nullable
- `address`: `VARCHAR(255)`, Not Null
- `city`: `VARCHAR(100)`, Indexed
- `state`: `VARCHAR(100)`, Not Null
- `postal_code`: `VARCHAR(20)`, Not Null
- `latitude`: `FLOAT`, Nullable
- `longitude`: `FLOAT`, Nullable
- `status`: `VARCHAR(20)`, Indexed (pending, active, rejected, inactive)
- `availability_status`: `VARCHAR(30)`, Default `'available'` (available, rented, sold)
- `rejection_reason`: `TEXT`, Nullable
- `created_at`: `DATETIME`, Timestamp
- `updated_at`: `DATETIME`, Timestamp

### 3. `property_images`
- `id`: `INTEGER`, Primary Key
- `property_id`: `INTEGER`, Foreign Key referencing `properties(id)` with `ON DELETE CASCADE`
- `image_url`: `VARCHAR(500)`, Not Null
- `is_primary`: `BOOLEAN`, Default `FALSE`
- `created_at`: `DATETIME`, Timestamp

### 4. `amenities`
- `id`: `INTEGER`, Primary Key
- `name`: `VARCHAR(50)`, Unique, Not Null
- `icon`: `VARCHAR(50)`, Nullable

### 5. `property_amenities` (Many-to-Many Association)
- `property_id`: `INTEGER`, Foreign Key referencing `properties(id)` with `CASCADE`
- `amenity_id`: `INTEGER`, Foreign Key referencing `amenities(id)` with `CASCADE`
- Primary Key: `(property_id, amenity_id)`

### 6. `favorites`
- `id`: `INTEGER`, Primary Key
- `user_id`: `INTEGER`, Foreign Key referencing `users(id)` with `CASCADE`
- `property_id`: `INTEGER`, Foreign Key referencing `properties(id)` with `CASCADE`
- `created_at`: `DATETIME`, Timestamp
- Constraint: `UniqueConstraint('user_id', 'property_id')` (prevents duplicate saves)

### 7. `enquiries`
- `id`: `INTEGER`, Primary Key
- `user_id`: `INTEGER`, Foreign Key referencing `users(id)` with `CASCADE`
- `property_id`: `INTEGER`, Foreign Key referencing `properties(id)` with `CASCADE`
- `message`: `TEXT`, Not Null
- `status`: `VARCHAR(30)`, Default `'pending'` (pending, replied, closed)
- `owner_reply`: `TEXT`, Nullable
- `created_at`: `DATETIME`, Timestamp
- `updated_at`: `DATETIME`, Timestamp

### 8. `property_visits`
- `id`: `INTEGER`, Primary Key
- `user_id`: `INTEGER`, Foreign Key referencing `users(id)` with `CASCADE`
- `property_id`: `INTEGER`, Foreign Key referencing `properties(id)` with `CASCADE`
- `requested_at`: `DATETIME`, Not Null
- `time_slot`: `VARCHAR(50)`, Not Null
- `status`: `VARCHAR(30)`, Default `'pending'` (pending, confirmed, rejected, cancelled, completed)
- `customer_message`: `TEXT`, Nullable
- `owner_response`: `TEXT`, Nullable
- `created_at`: `DATETIME`, Timestamp
- `updated_at`: `DATETIME`, Timestamp
