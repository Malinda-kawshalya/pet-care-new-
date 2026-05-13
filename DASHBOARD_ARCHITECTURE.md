# Pet Care System - Dashboard Architecture

## Overview
This document outlines the refined pet care system with role-based dashboards for 5 user types.

## User Roles & Dashboard Features

### 1. **Pet Owner Dashboard**
**Primary Goal**: Manage pets, bookings, health records, and marketplace purchases

**Dashboard Components**:
- **Home Widget**: Quick stats (active pets, upcoming appointments, pending notifications)
- **My Pets Section**: List/manage all pets with quick access
- **Appointments Widget**: Upcoming vet/grooming/training appointments
- **Medical Records**: Quick access to vaccination status and health alerts
- **My Orders**: Recent marketplace purchases and tracking
- **Match Requests**: Pending and accepted match requests
- **Adoption Listings**: Pets posted/interested in adoption
- **Quick Actions**: Add pet, Book appointment, Browse marketplace

**Key Features**:
- Pet health dashboard with vaccination reminders
- Appointment booking and management
- Medical records and QR code access
- Order history and tracking
- Match request management
- Blog/community access

---

### 2. **Veterinarian Dashboard**
**Primary Goal**: Manage appointments, patient records, and consultations

**Dashboard Components**:
- **Schedule Widget**: Today's appointments, available slots
- **Patient Management**: List of pets under care with health history
- **Medical Records**: Add/view prescriptions, medical notes
- **Appointments**: Upcoming, completed, and cancelled appointments
- **Messages**: Direct messages with pet owners
- **Reports**: Generate health reports, analytics
- **Availability Settings**: Manage time slots and services

**Key Features**:
- Appointment calendar with booking management
- Patient medical history and records management
- Prescription and documentation upload
- Direct messaging with owners
- Services and pricing management
- Performance analytics

---

### 3. **Pet Shop Owner Dashboard**
**Primary Goal**: Manage inventory, sales, and customer interactions

**Dashboard Components**:
- **Sales Widget**: Today's sales, revenue metrics
- **Inventory**: Product stock levels and alerts
- **Orders**: Pending, shipped, delivered orders
- **Products**: Add/edit/delete products with images
- **Reviews**: Customer reviews and ratings
- **Customers**: Customer list and purchase history
- **Reports**: Sales analytics, bestsellers

**Key Features**:
- Product inventory management
- Order processing and shipping tracking
- Customer feedback and reviews
- Sales analytics and reports
- Pricing and discount management

---

### 4. **Groomer Dashboard**
**Primary Goal**: Manage grooming appointments and services

**Dashboard Components**:
- **Schedule**: Today's grooming appointments
- **Appointments**: Upcoming, history, and cancellations
- **Customers**: Pet owner and pet information
- **Services**: Grooming services offered and pricing
- **Gallery**: Before/after photos of grooming work
- **Messages**: Client communications
- **Availability**: Manage working hours and slots

**Key Features**:
- Appointment calendar and scheduling
- Service and pricing management
- Customer database
- Work portfolio/gallery
- Direct client messaging
- Availability management

---

### 5. **Admin Dashboard**
**Primary Goal**: System-wide management, monitoring, and moderation

**Dashboard Components**:
- **System Overview**: Total users, revenue, active services
- **User Management**: Approve/block accounts by role
- **Analytics**: System-wide statistics and trends
- **Reports**: User reports, disputes, violations
- **Content Moderation**: Moderate blogs, reviews, posts
- **Product Management**: Monitor marketplace products
- **Notifications**: Send system-wide notifications
- **Logs**: System activity and audit logs

**Key Features**:
- User account approval and management
- System analytics and insights
- Content moderation tools
- Dispute and report resolution
- Platform-wide notifications
- Financial reports and analytics

---

## Authentication Flow

```
1. User Login → Role Verification → Redirect to Role-Specific Dashboard
2. JWT Token stored with role information
3. Protected routes check both authentication and authorization
```

## Database Relationships

```
User
├── role (enum: petOwner, vet, petShop, groomer, admin)
├── profile (extends based on role)
├── status (approved/pending/blocked)
└── permissions (role-based)

Pet (linked to petOwner)
├── owner (User reference)
├── medical history
└── vaccinations

Appointment (linked to service provider and pet owner)
├── service provider (Vet/Groomer reference)
├── pet owner (User reference)
├── pet
└── status

Order (linked to petShop and petOwner)
├── seller (Pet Shop reference)
├── buyer (User reference)
└── products

MatchRequest (linked to pet owners)
├── from (User reference)
├── to (User reference)
├── pets
└── status
```

---

## Folder Structure Expansion

```
client/src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── dashboards/
│   │   ├── petOwnerDashboard/
│   │   │   ├── PetOwnerDashboard.jsx
│   │   │   ├── PetsWidget.jsx
│   │   │   ├── AppointmentsWidget.jsx
│   │   │   └── HealthWidget.jsx
│   │   ├── vetDashboard/
│   │   │   ├── VetDashboard.jsx
│   │   │   ├── ScheduleWidget.jsx
│   │   │   └── PatientsWidget.jsx
│   │   ├── petShopDashboard/
│   │   │   ├── PetShopDashboard.jsx
│   │   │   ├── InventoryWidget.jsx
│   │   │   └── SalesWidget.jsx
│   │   ├── groomerDashboard/
│   │   │   ├── GroomerDashboard.jsx
│   │   │   └── ScheduleWidget.jsx
│   │   └── adminDashboard/
│   │       ├── AdminDashboard.jsx
│   │       ├── UsersWidget.jsx
│   │       ├── AnalyticsWidget.jsx
│   │       └── ModerationWidget.jsx
│   └── modules/
│       ├── PetManagement/
│       ├── HealthManagement/
│       ├── Appointments/
│       ├── Marketplace/
│       ├── Adoption/
│       ├── Matching/
│       ├── Community/
│       └── Notifications/
├── hooks/
│   ├── useAuth.js
│   ├── useRole.js
│   └── useNotifications.js
├── utils/
│   ├── roleHelper.js
│   ├── authHelper.js
│   └── constants.js
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
└── pages/
    ├── Dashboard.jsx
    ├── Home.jsx
    └── ...
```

---

## Implementation Priority

### Phase 1: Foundation
- [ ] Role-based authentication system
- [ ] User model with role field
- [ ] Protected routes and role verification middleware

### Phase 2: Dashboard Core
- [ ] Pet Owner Dashboard (50% of users)
- [ ] Admin Dashboard (management)
- [ ] Authentication flow refinement

### Phase 3: Service Provider Dashboards
- [ ] Vet Dashboard
- [ ] Pet Shop Dashboard
- [ ] Groomer Dashboard

### Phase 4: Features & Enhancement
- [ ] Notifications system
- [ ] Advanced analytics
- [ ] AI features (vaccination prediction, health alerts)

---

## Security Considerations

1. **Role-Based Access Control (RBAC)**
   - Verify role on every protected route
   - Backend validation on all API endpoints
   - Role-specific data filtering

2. **Data Privacy**
   - Users can only access their own data
   - Service providers access customer data only
   - Admin access is logged

3. **Authentication**
   - JWT tokens with role embedded
   - Token expiration and refresh mechanism
   - Secure password hashing

4. **Authorization**
   - Middleware to check user role
   - API endpoint protection by role
   - UI component hiding based on role

---

## API Endpoints by Role

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### Pet Owner
```
GET /api/petowner/dashboard
GET /api/petowner/pets
POST /api/petowner/pets
GET /api/petowner/appointments
```

### Veterinarian
```
GET /api/vet/dashboard
GET /api/vet/schedule
GET /api/vet/patients
POST /api/vet/medical-records
```

### Pet Shop Owner
```
GET /api/petshop/dashboard
GET /api/petshop/products
POST /api/petshop/products
GET /api/petshop/orders
```

### Groomer
```
GET /api/groomer/dashboard
GET /api/groomer/schedule
GET /api/groomer/services
```

### Admin
```
GET /api/admin/dashboard
GET /api/admin/users
PUT /api/admin/users/:id/approve
GET /api/admin/reports
POST /api/admin/notifications
```

---

## Advanced Features Roadmap

### AI/ML Features
- Vaccination date prediction
- Health risk scoring
- Disease trend analysis
- Pet diet recommendations
- Health alert notifications

### Additional Features
- QR code medical profile
- Emergency SOS system
- Pet lost & found module
- Real-time chat with service providers
- Push notifications
- Mobile app adaptation

---
