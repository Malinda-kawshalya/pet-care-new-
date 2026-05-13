# Pet Care System - API Reference Guide

## Base URL
```
Development: http://localhost:5000/api
Production: [your-production-url]/api
```

## Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 1. Authentication Endpoints

### Register New User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "petOwner|vet|petShop|groomer|admin",
  "phone": "123-456-7890"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "role": "petOwner",
    "status": "pending|approved|blocked"
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "petOwner",
    "status": "approved"
  }
}
```

### Get Current User Profile
```
GET /auth/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "petOwner",
    "phone": "123-456-7890",
    "status": "approved",
    "profileImage": "url_to_image",
    "createdAt": "2025-05-01T00:00:00Z"
  }
}
```

### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "987-654-3210",
  "bio": "Pet lover and veterinarian"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ...updated user data }
}
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Dashboard Endpoints

### Pet Owner Dashboard
```
GET /dashboard/petowner
Authorization: Bearer <token>
Headers: { role: petOwner }

Response (200):
{
  "success": true,
  "data": {
    "totalPets": 4,
    "upcomingAppointments": 2,
    "vaccinationsDue": 3,
    "totalSpent": 245,
    "pets": [...],
    "appointments": [...],
    "alerts": [...]
  }
}
```

### Veterinarian Dashboard
```
GET /dashboard/vet
Authorization: Bearer <token>
Headers: { role: vet }

Response (200):
{
  "success": true,
  "data": {
    "todayAppointments": 3,
    "activePatients": 24,
    "pendingRecords": 12,
    "averageRating": 4.8,
    "schedule": [...],
    "patients": [...],
    "records": [...]
  }
}
```

### Pet Shop Dashboard
```
GET /dashboard/petshop
Authorization: Bearer <token>
Headers: { role: petShop }

Response (200):
{
  "success": true,
  "data": {
    "todaySales": "$1,250",
    "todayOrders": 8,
    "weekRevenue": "$8,750",
    "totalCustomers": 156,
    "products": [...],
    "orders": [...],
    "inventory": [...]
  }
}
```

### Groomer Dashboard
```
GET /dashboard/groomer
Authorization: Bearer <token>
Headers: { role: groomer }

Response (200):
{
  "success": true,
  "data": {
    "todayAppointments": 3,
    "todayEarnings": "$115",
    "regularCustomers": 42,
    "averageRating": 4.9,
    "schedule": [...],
    "services": [...],
    "reviews": [...]
  }
}
```

### Admin Dashboard
```
GET /dashboard/admin
Authorization: Bearer <token>
Headers: { role: admin }

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 2850,
    "pendingApprovals": 45,
    "blockedAccounts": 12,
    "totalRevenue": "$125,430",
    "userBreakdown": {...},
    "approvals": [...],
    "reports": [...]
  }
}
```

---

## 3. Pet Management Endpoints

### Get All User's Pets
```
GET /pets
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "pets": [
    {
      "id": "pet_id",
      "name": "Max",
      "breed": "Golden Retriever",
      "age": "3 years",
      "gender": "Male",
      "vaccinated": true,
      "owner": "user_id",
      "images": ["url1", "url2"],
      "medicalHistory": [...],
      "createdAt": "2025-01-01"
    }
  ]
}
```

### Get Single Pet Details
```
GET /pets/:petId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "pet": { ...pet details with full medical history }
}
```

### Create New Pet
```
POST /pets
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Max",
  "breed": "Golden Retriever",
  "age": "3",
  "gender": "Male",
  "weight": "30",
  "microchipId": "123456789",
  "dateOfBirth": "2022-01-15",
  "images": [file1, file2]
}

Response (201):
{
  "success": true,
  "message": "Pet created successfully",
  "pet": { ...new pet data }
}
```

### Update Pet
```
PUT /pets/:petId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Max",
  "breed": "Golden Retriever",
  "age": "4",
  "images": [file1]
}

Response (200):
{
  "success": true,
  "message": "Pet updated successfully",
  "pet": { ...updated pet data }
}
```

### Delete Pet
```
DELETE /pets/:petId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Pet deleted successfully"
}
```

---

## 4. Medical Records Endpoints

### Get Pet's Medical Records
```
GET /medical-records?petId=pet_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "records": [
    {
      "id": "record_id",
      "pet": "pet_id",
      "type": "checkup|vaccination|prescription|surgery",
      "date": "2025-05-15",
      "veterinarian": "vet_name",
      "description": "Annual checkup",
      "diagnosis": "Healthy",
      "treatment": "None",
      "documents": ["url1", "url2"],
      "createdAt": "2025-05-15"
    }
  ]
}
```

### Add Medical Record
```
POST /medical-records
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "pet": "pet_id",
  "type": "vaccination",
  "date": "2025-05-15",
  "veterinarian": "vet_id",
  "description": "Rabies vaccination",
  "diagnosis": "Completed",
  "treatment": "N/A",
  "documents": [file1, file2]
}

Response (201):
{
  "success": true,
  "message": "Medical record added successfully",
  "record": { ...new record data }
}
```

### Update Medical Record
```
PUT /medical-records/:recordId
Authorization: Bearer <token>

{
  "description": "Updated description",
  "treatment": "Antibiotics prescribed"
}

Response (200):
{
  "success": true,
  "record": { ...updated record }
}
```

---

## 5. Appointments Endpoints

### Get All Appointments
```
GET /appointments
Authorization: Bearer <token>

Query Parameters:
- status: pending|confirmed|completed|cancelled
- dateFrom: YYYY-MM-DD
- dateTo: YYYY-MM-DD

Response (200):
{
  "success": true,
  "appointments": [
    {
      "id": "apt_id",
      "pet": "pet_id",
      "petName": "Max",
      "serviceProvider": "provider_id",
      "serviceType": "veterinary|grooming|training",
      "date": "2025-05-20",
      "time": "10:00 AM",
      "duration": "1 hour",
      "status": "confirmed",
      "notes": "Annual checkup",
      "createdAt": "2025-05-15"
    }
  ]
}
```

### Book Appointment
```
POST /appointments
Authorization: Bearer <token>

{
  "pet": "pet_id",
  "serviceProvider": "provider_id",
  "serviceType": "veterinary",
  "date": "2025-05-20",
  "time": "10:00",
  "notes": "Annual checkup"
}

Response (201):
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": { ...appointment data }
}
```

### Get Available Slots
```
GET /appointments/available-slots/:providerId
Authorization: Bearer <token>

Query Parameters:
- date: YYYY-MM-DD
- serviceType: veterinary|grooming|training

Response (200):
{
  "success": true,
  "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

### Cancel Appointment
```
PUT /appointments/:appointmentId/cancel
Authorization: Bearer <token>

{
  "reason": "Need to reschedule"
}

Response (200):
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## 6. Products/Marketplace Endpoints

### Get All Products
```
GET /products
Authorization: Bearer <token>

Query Parameters:
- category: food|toys|accessories|health|grooming
- sortBy: popularity|price|rating
- limit: 20
- page: 1

Response (200):
{
  "success": true,
  "products": [
    {
      "id": "prod_id",
      "name": "Premium Dog Food",
      "description": "High-quality dog food",
      "price": 29.99,
      "category": "food",
      "seller": "shop_id",
      "stock": 45,
      "images": ["url1"],
      "rating": 4.8,
      "reviews": 120,
      "createdAt": "2025-01-01"
    }
  ],
  "total": 500,
  "page": 1,
  "pages": 25
}
```

### Create Product (Pet Shop Only)
```
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data
Headers: { role: petShop }

{
  "name": "Premium Dog Food",
  "description": "High-quality dog food",
  "price": 29.99,
  "category": "food",
  "stock": 100,
  "images": [file1, file2]
}

Response (201):
{
  "success": true,
  "product": { ...product data }
}
```

### Create Order
```
POST /orders
Authorization: Bearer <token>

{
  "items": [
    { "product": "prod_id", "quantity": 2 },
    { "product": "prod_id2", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  }
}

Response (201):
{
  "success": true,
  "order": {
    "id": "order_id",
    "items": [...],
    "total": 89.97,
    "status": "pending",
    "trackingNumber": "TRACK123"
  }
}
```

---

## 7. User Management Endpoints (Admin Only)

### Get All Users
```
GET /admin/users
Authorization: Bearer <token>
Headers: { role: admin }

Query Parameters:
- role: petOwner|vet|petShop|groomer|admin
- status: pending|approved|blocked
- page: 1
- limit: 20

Response (200):
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "vet",
      "status": "pending|approved|blocked",
      "createdAt": "2025-05-15",
      "approvedAt": null
    }
  ],
  "total": 150
}
```

### Approve User Account
```
PUT /admin/users/:userId/approve
Authorization: Bearer <token>
Headers: { role: admin }

Response (200):
{
  "success": true,
  "message": "User approved successfully",
  "user": { ...user data with status: approved }
}
```

### Block User Account
```
PUT /admin/users/:userId/block
Authorization: Bearer <token>
Headers: { role: admin }

{
  "reason": "Inappropriate behavior"
}

Response (200):
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

All endpoints are rate limited to 250 requests per 15 minutes per IP address.

---

## Pagination

Most list endpoints support pagination:

```
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)

Response includes:
- total: Total number of items
- page: Current page
- pages: Total number of pages
- items: Array of items
```

---

## Testing with Postman

1. Import the API collection from `postman-collection.json`
2. Set up environment variables for `BASE_URL` and `TOKEN`
3. Use the pre-configured requests for testing

---

