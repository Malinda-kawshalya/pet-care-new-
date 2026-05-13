# Pet Care System - Implementation Guide

## Project Overview

A comprehensive MERN stack web application for pet care management with role-based dashboards. The system supports 5 different user types, each with specialized features and dashboards.

## User Roles & Features

### 1. **Pet Owner**
- Manage multiple pets and their profiles
- Track medical records and vaccination status
- Book appointments (vet, grooming, training)
- Browse and purchase products from pet shops
- Participate in pet matching ("Find a Mate")
- Post and manage adoption listings
- Access community and blog posts
- Receive health and appointment reminders

**Dashboard Features**:
- Pet profile cards with vaccination status
- Upcoming appointments widget
- Health alerts and vaccination reminders
- Recent orders and marketplace activity
- Quick action buttons for common tasks

---

### 2. **Veterinarian**
- Manage patient appointments
- Access patient medical history
- Add and manage medical records
- Upload prescriptions and medical documents
- Manage availability and services
- Direct messaging with pet owners
- Performance analytics

**Dashboard Features**:
- Today's appointment schedule
- Patient management and history
- Medical records management
- Services and pricing management
- Calendar with upcoming appointments

---

### 3. **Pet Shop Owner**
- Manage product inventory
- Add/edit/delete products with images
- Monitor inventory levels and stock alerts
- Process and track orders
- Manage customer interactions
- View sales analytics and best sellers
- Customer review management

**Dashboard Features**:
- Sales and revenue widgets
- Inventory status and alerts
- Recent orders tracking
- Best sellers list
- Customer reviews and feedback

---

### 4. **Groomer**
- Manage grooming appointments
- Set services and pricing
- Manage availability and working hours
- Upload before/after photos to gallery
- Direct client communication
- View appointment calendar
- Track customer feedback

**Dashboard Features**:
- Today's schedule with timings
- Service and pricing management
- Upcoming appointments calendar
- Portfolio/gallery management
- Customer reviews and ratings

---

### 5. **Administrator**
- System-wide user management
- Approve/block user accounts by role
- Content moderation (blogs, reviews, comments)
- Monitor system reports and violations
- Platform analytics and insights
- System health monitoring
- Send system-wide notifications

**Dashboard Features**:
- System overview and statistics
- Pending user approvals
- Reports and violations management
- User breakdown by role
- Content moderation queue
- System health indicators
- Activity logs

---

## Project Structure

```
pet-care-new/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── dashboards/
│   │   │   │   ├── PetOwnerDashboard.jsx
│   │   │   │   ├── VetDashboard.jsx
│   │   │   │   ├── PetShopDashboard.jsx
│   │   │   │   ├── GroomerDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── modules/
│   │   │   │   ├── PetManagement/
│   │   │   │   ├── HealthManagement/
│   │   │   │   ├── Appointments/
│   │   │   │   ├── Marketplace/
│   │   │   │   ├── Adoption/
│   │   │   │   ├── Matching/
│   │   │   │   ├── Community/
│   │   │   │   └── Notifications/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Layout.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   └── ModulePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── roleHelper.js
│   │   │   ├── authHelper.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js (update with role logic)
│   │   │   ├── adminController.js
│   │   │   ├── aiController.js
│   │   │   ├── resourceController.js
│   │   │   └── dashboardController.js (NEW)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js (update with role check)
│   │   │   ├── errorMiddleware.js
│   │   │   └── roleMiddleware.js (NEW)
│   │   ├── models/
│   │   │   ├── User.js (update with role field)
│   │   │   ├── Pet.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── Vaccination.js
│   │   │   ├── Appointment.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── MatchRequest.js
│   │   │   ├── AdoptionPost.js
│   │   │   ├── Blog.js
│   │   │   ├── Message.js
│   │   │   ├── Notification.js
│   │   │   └── Review.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── authRoutes.js (update)
│   │   │   ├── dashboardRoutes.js (NEW)
│   │   │   ├── petOwnerRoutes.js (NEW)
│   │   │   ├── vetRoutes.js (NEW)
│   │   │   ├── petShopRoutes.js (NEW)
│   │   │   ├── groomerRoutes.js (NEW)
│   │   │   ├── adminRoutes.js (update)
│   │   │   └── crudRoutes.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── roleChecker.js (NEW)
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── IMPLEMENTATION_STEPS.md
│   ├── DASHBOARD_ARCHITECTURE.md
│   └── API_REFERENCE.md (NEW)
│
├── .env.example
├── package.json
└── README.md
```

---

## Setup Instructions

### 1. **Environment Setup**
```bash
# Clone the repository
git clone <repo-url>
cd pet-care-new

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 2. **Database Configuration**
- Create `.env` file in the server directory
- Configure `MONGO_URI` with your MongoDB Atlas connection string
- Set `JWT_SECRET` to a strong secret key
- Set `PORT` (default: 5000)
- Set `CLIENT_URL` (default: http://localhost:5173)

### 3. **Start the Application**

**Development Mode (both server and client)**:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 5173).

**Individual Start**:
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd client
npm run dev
```

---

## Key Features to Implement

### Phase 1: Authentication & Role Management (Priority: CRITICAL)
- [x] User model with role field
- [ ] Role-based registration
- [ ] Role-based login logic
- [ ] JWT token with role information
- [ ] Protected routes for each role
- [ ] Admin approval workflow for service providers

### Phase 2: Dashboard Implementation (Priority: HIGH)
- [x] Dashboard architecture design
- [x] Pet Owner Dashboard UI
- [x] Veterinarian Dashboard UI
- [x] Pet Shop Owner Dashboard UI
- [x] Groomer Dashboard UI
- [x] Admin Dashboard UI
- [ ] Dashboard data fetching from API
- [ ] Dashboard state management
- [ ] Real-time updates with WebSocket

### Phase 3: Core Features (Priority: HIGH)
- [ ] Pet Profile Management
  - Add/Edit/Delete pets
  - Pet image uploads
  - Medical history tracking
  
- [ ] Medical Records & Vaccinations
  - Add medical records
  - Upload documents
  - Vaccination tracking
  - Health reminders
  
- [ ] Appointment System
  - Service provider profiles
  - Availability management
  - Booking system
  - Calendar integration

### Phase 4: Marketplace & Community (Priority: MEDIUM)
- [ ] E-Commerce Module
  - Product browsing
  - Cart management
  - Payment processing
  - Order tracking
  
- [ ] Pet Matching System
  - Profile creation
  - Search and filters
  - Match requests
  - Communication

- [ ] Adoption Module
  - Adoption listings
  - Request management
  - Approval workflow

- [ ] Blog & Community
  - Post creation/editing
  - Comments and discussions
  - Admin moderation

### Phase 5: Advanced Features (Priority: MEDIUM)
- [ ] Notification System
  - Email notifications
  - Push notifications
  - SMS reminders
  
- [ ] AI Features
  - Vaccination prediction
  - Health risk alerts
  - Personalized recommendations
  
- [ ] Map Integration
  - Find nearby services
  - Location mapping
  - Navigation assistance

---

## API Endpoint Structure

### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/profile           - Get current user profile
PUT    /api/auth/profile           - Update profile
POST   /api/auth/forgot-password   - Forgot password
POST   /api/auth/reset-password    - Reset password
```

### Dashboard Routes
```
GET    /api/dashboard/petowner     - Pet Owner dashboard data
GET    /api/dashboard/vet          - Vet dashboard data
GET    /api/dashboard/petshop      - Pet Shop dashboard data
GET    /api/dashboard/groomer      - Groomer dashboard data
GET    /api/dashboard/admin        - Admin dashboard data
```

### User Management (Admin Only)
```
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id/approve - Approve user
PUT    /api/admin/users/:id/block   - Block user
GET    /api/admin/reports          - Get user reports
```

### Pet Management
```
GET    /api/pets                   - Get user's pets
POST   /api/pets                   - Create new pet
PUT    /api/pets/:id               - Update pet
DELETE /api/pets/:id               - Delete pet
GET    /api/pets/:id/medical-records - Get pet medical records
```

### Appointments
```
GET    /api/appointments           - Get user's appointments
POST   /api/appointments           - Create appointment
PUT    /api/appointments/:id       - Update appointment
DELETE /api/appointments/:id       - Cancel appointment
GET    /api/appointments/:id/availability - Get provider availability
```

---

## Technology Stack

**Frontend**:
- React 18+
- React Router v6
- Vite (Build tool)
- CSS for styling
- Fetch API for HTTP requests

**Backend**:
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Bcryptjs for password hashing
- Helmet for security
- CORS for cross-origin requests

**Development**:
- npm for package management
- Git for version control
- Environment variables (.env)

---

## Security Best Practices

1. **Authentication**
   - Use JWT tokens with expiration
   - Store tokens securely
   - Implement refresh token mechanism

2. **Authorization**
   - Check user role on every protected endpoint
   - Verify ownership of resources
   - Use role-based middleware

3. **Data Protection**
   - Hash passwords with bcryptjs
   - Use HTTPS in production
   - Validate and sanitize inputs
   - Implement rate limiting

4. **CORS & Headers**
   - Use Helmet for security headers
   - Configure CORS properly
   - Disable unnecessary endpoints

---

## Testing Credentials (Development Only)

```
Pet Owner:
Email: owner@example.com
Password: password123

Veterinarian:
Email: vet@example.com
Password: password123

Pet Shop Owner:
Email: shop@example.com
Password: password123

Groomer:
Email: groomer@example.com
Password: password123

Admin:
Email: admin@example.com
Password: password123
```

---

## Common Issues & Solutions

### MongoDB Connection Error
- Verify `MONGO_URI` in `.env`
- Check if MongoDB Atlas cluster is accessible
- Ensure IP whitelist includes your IP

### Port Already in Use
```bash
# Kill process on port 5000 (server)
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173 (client)
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module Not Found Errors
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. Update User model with role field and validation
2. Update authController with role assignment logic
3. Implement roleMiddleware for route protection
4. Create dashboardController for dashboard data
5. Connect dashboard components to API endpoints
6. Implement state management (Context API or Redux)
7. Add real-time notifications with Socket.io
8. Implement advanced features (AI, maps, etc.)

---

## Additional Resources

- [MERN Stack Documentation](https://mern.io)
- [Mongoose Schema Guide](https://mongoosejs.com)
- [React Router Guide](https://reactrouter.com)
- [JWT Authentication](https://jwt.io)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

