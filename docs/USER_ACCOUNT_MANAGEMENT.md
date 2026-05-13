# User Account Management System - Complete Implementation

## Overview
A comprehensive user authentication and account management system with role-based access control, admin user management, and demo login functionality.

---

## Backend Implementation

### Authentication Endpoints

#### Public Routes
```
POST /api/auth/register
  Body: { name, email, password, role, phone, address, bio, providerProfile }
  Response: { user, token, verificationToken, message }
  
POST /api/auth/login
  Body: { email, password }
  Response: { user, token }
  
POST /api/auth/forgot-password
  Body: { email }
  Response: { message, resetToken }
  
POST /api/auth/reset-password
  Body: { token, password }
  Response: { message }
  
POST /api/auth/verify-email
  Body: { token }
  Response: { message, user }
```

#### Protected Routes (Require Authentication)
```
GET /api/auth/me
  Response: { user }
  
PUT /api/auth/profile
  Body: { name, email, phone, address, bio, avatar, providerProfile }
  Response: { user }
  
PUT /api/auth/change-password
  Body: { currentPassword, newPassword }
  Response: { message }
  
POST /api/auth/logout
  Response: { message }
  
POST /api/auth/resend-verification
  Response: { message, verificationToken }
```

### Admin Management Endpoints

#### User Management (Admin Only)
```
POST /api/auth/seed-demo
  Response: { message, accounts: [{ email, status, userId }] }
  
GET /api/auth/users?page=1&limit=10
  Response: { users: [...], pagination: { total, page, pages } }
  
GET /api/auth/users/:userId
  Response: { user }
  
PUT /api/auth/users/:userId/approval
  Body: { approvalStatus: "pending|approved|blocked|rejected" }
  Response: { message, user }
  
PUT /api/auth/users/:userId/role
  Body: { role: "petOwner|veterinarian|petShop|groomer|admin" }
  Response: { message, user }
  
DELETE /api/auth/users/:userId
  Response: { message }
  
GET /api/stats/users
  Response: { totalUsers, byRole: {...}, byApprovalStatus: {...}, emailVerified, emailUnverified }
  
GET /api/auth/approvals/pending
  Response: { count, users: [...] }
```

### User Roles & Approval

**Roles:**
- `petOwner` - Regular pet owner (auto-approved)
- `veterinarian` - Vet service provider (requires admin approval)
- `petShop` - Pet shop owner (requires admin approval)
- `groomer` - Professional groomer (requires admin approval)
- `admin` - System administrator

**Approval Statuses:**
- `pending` - Awaiting admin review (service providers)
- `approved` - User account active
- `blocked` - Account suspended
- `rejected` - Registration rejected

### Demo Accounts
Automatically created on seed endpoint:
- **Pet Owner**: owner@demo.com / demo123
- **Veterinarian**: vet@demo.com / demo123
- **Pet Shop**: shop@demo.com / demo123
- **Groomer**: groomer@demo.com / demo123
- **Admin**: admin@demo.com / demo123

All demo accounts have:
- Email pre-verified
- Status: Approved
- Phone: Random generated
- Address: 123 Demo Street, Demo City
- Provider Profile (for service providers)

---

## Frontend Implementation

### Authentication Flow

**Login Page Features:**
1. **Standard Login**
   - Email/password form
   - Error/success messages
   - Remember me option

2. **Demo Login Buttons**
   - Quick login for each role
   - 5 role-specific demo buttons
   - Auto-fills credentials and logs in

3. **Password Reset**
   - Email verification
   - Token-based reset flow
   - New password setting

### User Profile Management

**Profile Tab:**
- View/edit basic info (name, email, phone, address)
- Update bio
- Change password
- Email verification status
- Provider profile for service providers

**Provider Profile Fields:**
- Business name
- License number
- Service area
- Specialties

### Admin Dashboard

**Features:**
1. **Statistics Cards**
   - Total users count
   - Pending approvals
   - Blocked accounts
   - Email verification stats
   - User breakdown by role

2. **Pending Provider Approvals**
   - List of pending service providers
   - Quick approve/reject buttons
   - Provider business info display

3. **User Management Table**
   - Search by name/email
   - Filter by role
   - Filter by approval status
   - Inline actions:
     - Approve (pending users)
     - Reject (pending users)
     - Block/Unblock
     - Delete
   - Status color-coding

4. **Demo Account Seeding**
   - Button to create demo accounts
   - Checks for existing accounts
   - Reports creation status

### Navigation & Access Control

**Public Users See:**
- Home
- Shop
- Login button
- Guest CTAs

**Authenticated Users See:**
- Home
- Dashboard (role-specific)
- Pets
- Health
- Bookings
- Shop
- User menu (profile, settings, logout)

**Admin Users See:**
- Everything above
- Admin link
- Admin Dashboard

---

## Data Structures

### User Model
```javascript
{
  id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  bio: String,
  avatar: String (URL),
  role: "petOwner|veterinarian|petShop|groomer|admin",
  approvalStatus: "pending|approved|blocked|rejected",
  isEmailVerified: Boolean,
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  providerProfile: {
    businessName: String,
    licenseNumber: String,
    serviceArea: String,
    specialties: [String]
  },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Password Security**
   - Bcrypt hashing
   - Minimum 6 characters required
   - Change password function

2. **Token Security**
   - JWT tokens for authentication
   - Configurable expiration (7 days default)
   - Bearer token authentication

3. **Email Verification**
   - Token-based verification
   - 24-hour expiration
   - Resend capability

4. **Account Protection**
   - Admin approval for service providers
   - Account blocking by admin
   - Rate limiting on auth endpoints

5. **Access Control**
   - Role-based middleware
   - Protected routes require authentication
   - Admin-only endpoints

---

## Frontend Components

### AuthPage.jsx
- Register form
- Login form with demo buttons
- Password reset form
- Profile management
- Email verification
- Password change

### AdminDashboard.jsx
- Statistics overview
- Pending approvals panel
- User management table
- Search and filtering
- Action buttons (approve, reject, block, delete)
- Demo account seeding

### Layout.jsx
- Role-based navigation
- User menu dropdown
- Demo login integration

---

## API Configuration

### Base URL
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});
```

### Authentication Header
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petcare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Usage Instructions

### For End Users

**Registration:**
1. Click Register
2. Fill in user details
3. Select role
4. Submit form
5. Verify email (if service provider, wait for admin approval)

**Login:**
1. Standard: Enter email/password
2. Demo: Click role-specific demo button
3. Auto-login to dashboard

**Profile Management:**
1. Login to access profile tab
2. Edit information
3. Change password
4. Check email verification status

### For Admins

**User Management:**
1. Navigate to Admin Dashboard
2. View pending approvals
3. Approve or reject service providers
4. View all users with filters
5. Block, unblock, or delete users as needed

**Demo Accounts:**
1. Click "Seed Demo Accounts" button
2. System creates demo accounts if not exists
3. Use credentials to test each role

**Statistics:**
1. View overview cards for key metrics
2. Monitor approval queue
3. Track user distribution by role

---

## Workflow Examples

### Service Provider Registration Flow
1. User registers as Veterinarian/Pet Shop/Groomer
2. Account created with "pending" approval status
3. Appears in admin pending approvals queue
4. Admin reviews and approves/rejects
5. User notified and can access dashboard (if approved)
6. User blocked if rejected

### Pet Owner Registration Flow
1. User registers as Pet Owner
2. Account created with "approved" status
3. Can login immediately
4. Receives verification email
5. Can access all features while email verification pending

### Admin User Management
1. Admin can view all users
2. Filter by role, status, name, email
3. Quick actions for approve, reject, block, delete
4. Statistics updated in real-time

---

## Testing

### Demo Accounts
Quick testing with pre-created demo accounts:
- owner@demo.com - Pet owner functionality
- vet@demo.com - Vet dashboard and features
- shop@demo.com - Pet shop management
- groomer@demo.com - Groomer services
- admin@demo.com - Admin controls and user management

### API Testing
Use any API client (Postman, Insomnia):
```
POST http://localhost:5000/api/auth/login
Body: { email: "admin@demo.com", password: "demo123" }

GET http://localhost:5000/api/auth/users
Header: Authorization: Bearer {token}
```

---

## Error Handling

**Common Errors:**
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found (user doesn't exist)
- 409: Conflict (email already registered)
- 400: Bad request (invalid data)
- 500: Server error

---

## Future Enhancements

1. Two-factor authentication
2. OAuth/Social login
3. Email notifications on status changes
4. User profile images/avatars
5. Activity logging and audit trail
6. Bulk user operations
7. User suspension/deactivation
8. Role change workflows
9. Permission matrix management
10. User analytics and insights
