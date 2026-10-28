# REST API Reference Documentation

Base URL: `http://localhost:8000/api`  
Interactive Swagger Docs: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account (Customer or Owner) |
| `POST` | `/auth/login` | Public | Authenticate with email & password, returns JWT token |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/auth/profile` | Authenticated | Update full name, phone number, or avatar |
| `POST` | `/auth/change-password`| Authenticated | Secure password modification |
| `POST` | `/auth/logout` | Authenticated | End active session |

---

## 2. Properties Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/properties` | Public | Search, filter, and paginate properties |
| `GET` | `/properties/{id}` | Public | Detailed property view with images and amenities |
| `POST` | `/properties` | Owner / Admin | Submit a new property listing for review |
| `PATCH`| `/properties/{id}` | Owner / Admin | Update existing property (owner permission verified) |
| `DELETE`| `/properties/{id}`| Owner / Admin | Delete property listing |

### Query Parameters for `/properties`
- `search`: Keyword search in title, address, description
- `city`: Filter by city (e.g. Chennai)
- `listing_type`: `rent` or `buy` / `sale`
- `property_type`: `Apartment`, `House`, `Villa`, `Studio`, `Commercial`, `Office Space`
- `min_price`: Minimum numeric price
- `max_price`: Maximum numeric price
- `bedrooms`: Minimum number of bedrooms
- `bathrooms`: Minimum number of bathrooms
- `furnishing_status`: `Furnished`, `Semi-furnished`, `Unfurnished`
- `sort_by`: `newest`, `price_asc`, `price_desc`, `bedrooms_desc`, `oldest`
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 12)

---

## 3. Favorites Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/favorites` | Customer | Retrieve user's saved favorite properties |
| `POST` | `/favorites` | Customer | Add property to favorites |
| `DELETE`| `/favorites/{id}` | Customer | Remove property from favorites |

---

## 4. Enquiries Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/enquiries` | Customer | Submit an enquiry message to the property owner |
| `GET` | `/enquiries/my` | Customer | Retrieve customer's sent enquiries and owner replies |
| `GET` | `/enquiries/owner` | Owner | Inbox of inquiries received for owner's properties |
| `PATCH`| `/enquiries/{id}` | Owner | Reply to an enquiry and mark as replied |

---

## 5. Property Visits Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/visits` | Customer | Schedule an in-person property inspection |
| `GET` | `/visits/my` | Customer | Retrieve scheduled visits requested by customer |
| `GET` | `/visits/owner` | Owner | Retrieve visit requests for owner's properties |
| `PATCH`| `/visits/{id}` | Owner / Cust | Confirm, decline, or cancel visit booking |
| `DELETE`| `/visits/{id}` | Owner / Cust | Cancel visit request |

---

## 6. Owner Dashboard Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/owner/dashboard` | Owner | Aggregated summary metrics, recent properties & visits |
| `GET` | `/owner/properties`| Owner | Full list of owner's properties with status filter |

---

## 7. Administrator Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin Only | Platform overview statistics, recent submissions |
| `GET` | `/admin/users` | Admin Only | List all registered users with role and search filters |
| `PATCH`| `/admin/users/{id}/toggle-active` | Admin Only | Activate or deactivate a user account |
| `GET` | `/admin/properties/pending` | Admin Only | List properties awaiting admin approval |
| `PATCH`| `/admin/properties/{id}/approve` | Admin Only | Approve property and publish to marketplace |
| `PATCH`| `/admin/properties/{id}/reject` | Admin Only | Reject property with admin feedback reason |
| `GET` | `/admin/properties` | Admin Only | Complete directory of all platform listings |
