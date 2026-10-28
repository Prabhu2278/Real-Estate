import pytest

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "priya@example.com"
    assert data["user"]["role"] == "customer"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_register_new_user(client):
    response = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "testuser@example.com",
        "password": "password123",
        "phone": "+91 91234 56789",
        "role": "customer"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "testuser@example.com"

def test_get_properties(client):
    response = client.get("/api/properties")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["total"] >= 1

def test_filter_properties_by_city(client):
    response = client.get("/api/properties?city=Chennai")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert "chennai" in item["city"].lower()

def test_filter_properties_by_type_and_listing(client):
    response = client.get("/api/properties?property_type=Apartment&listing_type=rent")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["property_type"] == "Apartment"
        assert item["listing_type"] == "rent"

def test_property_details(client):
    # First get properties to get an ID
    props_res = client.get("/api/properties")
    first_id = props_res.json()["items"][0]["id"]
    
    res = client.get(f"/api/properties/{first_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == first_id
    assert "images" in detail
    assert "amenities" in detail

def test_owner_property_creation_and_permissions(client):
    # Login as Ramesh (owner)
    login_res = client.post("/api/auth/login", json={
        "email": "ramesh@example.com",
        "password": "owner123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create new property
    create_res = client.post("/api/properties", headers=headers, json={
        "title": "New Beachfront Villa",
        "description": "Stunning new villa in Kovalam with panoramic beach views.",
        "property_type": "Villa",
        "listing_type": "rent",
        "price": 75000.0,
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 2400.0,
        "furnishing_status": "Furnished",
        "address": "45 ECR Road",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postal_code": "603112",
        "amenity_names": ["Parking", "Swimming Pool"],
        "image_urls": ["https://images.unsplash.com/photo-1613490493576-7fde63acd811"]
    })
    assert create_res.status_code == 201
    new_prop = create_res.json()
    prop_id = new_prop["id"]
    assert new_prop["status"] == "pending"

    # Now login as Priya (customer) and try to edit Ramesh's property -> Should be FORBIDDEN
    priya_res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    priya_token = priya_res.json()["access_token"]
    priya_headers = {"Authorization": f"Bearer {priya_token}"}

    priya_edit_res = client.patch(f"/api/properties/{prop_id}", headers=priya_headers, json={
        "title": "Hacked Title"
    })
    # Since Priya is customer, get_current_owner raises 403 Forbidden
    assert priya_edit_res.status_code == 403

def test_admin_approvals_and_security(client):
    # Customer cannot access admin dashboard
    priya_res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    priya_token = priya_res.json()["access_token"]
    priya_headers = {"Authorization": f"Bearer {priya_token}"}

    forbidden_res = client.get("/api/admin/dashboard", headers=priya_headers)
    assert forbidden_res.status_code == 403

    # Admin CAN access admin dashboard
    admin_res = client.post("/api/auth/login", json={
        "email": "admin@realestate.com",
        "password": "admin123"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    admin_dash = client.get("/api/admin/dashboard", headers=admin_headers)
    assert admin_dash.status_code == 200
    assert "stats" in admin_dash.json()

def test_favorites_workflow(client):
    # Login as Priya
    priya_res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    headers = {"Authorization": f"Bearer {priya_res.json()['access_token']}"}

    # Get favorites
    favs_res = client.get("/api/favorites", headers=headers)
    assert favs_res.status_code == 200
    favs = favs_res.json()
    assert isinstance(favs, list)

def test_enquiries_workflow(client):
    priya_res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    headers = {"Authorization": f"Bearer {priya_res.json()['access_token']}"}

    # Get my enquiries
    enq_res = client.get("/api/enquiries/my", headers=headers)
    assert enq_res.status_code == 200
    assert len(enq_res.json()) >= 1

def test_visits_workflow(client):
    priya_res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "customer123"
    })
    headers = {"Authorization": f"Bearer {priya_res.json()['access_token']}"}

    # Get my visits
    visits_res = client.get("/api/visits/my", headers=headers)
    assert visits_res.status_code == 200
    assert len(visits_res.json()) >= 1
