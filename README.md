# Pet Care Smart Platform

Pet Care Smart Platform is a full-stack MERN application for pet owners, veterinarians, pet shops, groomers, and administrators. The system combines pet profile management, medical records, appointments, marketplace operations, adoption, communication, and moderation in one role-based platform.

This README is written as a report-ready technical overview of what is implemented in this repository.

## 1. Project Summary

### Main objectives
- Centralize pet care workflows into one web application.
- Support multi-role operations with strict access control.
- Provide operational modules for health, services, commerce, and community.

### Implemented role dashboards
- Pet Owner dashboard
- Veterinarian dashboard
- Pet Shop dashboard
- Groomer dashboard
- Admin dashboard

### Core functional modules
- Authentication and account/profile management
- Pet profile CRUD and photo uploads
- Medical records and vaccination management
- Appointment booking and provider workflow
- Marketplace catalog, cart, checkout, and order flow
- Adoption listings, request flow, and owner decision flow
- Matching module
- Community posts/discussions and blog system
- Messaging and notifications
- AI utility endpoints

## 2. Tech Stack

### Frontend
- React 18
- React Router 6
- Vite
- Axios
- Lucide React (icons)
- Custom CSS design system (`global.css`, `rebrand.css`)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer for uploads
- Helmet, CORS, rate limiting, Morgan logging

### Workspace tooling
- npm workspaces (`client`, `server`)
- concurrently for parallel dev startup

## 3. Repository Structure

```text
pet-care-new-
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ contexts/
│  │  ├─ data/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ styles/
│  │  └─ utils/
│  └─ package.json
├─ server/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  └─ utils/
│  └─ package.json
├─ docs/
└─ README.md
```

## 4. Environment and Setup

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB

### Installation

```bash
git clone <your-repo-url>
cd pet-care-new-
npm install
```

### Server environment variables

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/pet-care-smart
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=5001
```

### Run in development

From project root:

```bash
npm run dev
```

Or separately:

```bash
# terminal 1
npm run server

# terminal 2
npm run client
```

### Build and run

```bash
npm run build
npm run start
```

### Seed demo data

```bash
cd server
npm run seed
```

To clear seeded data:

```bash
cd server
npm run seed:destroy
```

## 5. NPM Scripts

### Root
- `npm run dev` - start server and client in parallel
- `npm run client` - start Vite client
- `npm run server` - start backend with nodemon
- `npm run build` - production build of client
- `npm run start` - run server in production mode
- `npm run lint` - lint client code

### Client
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Server
- `npm run dev`
- `npm run start`
- `npm run seed`
- `npm run seed:destroy`

## 6. System Architecture

### Frontend architecture
- Route-driven app shell in `client/src/App.jsx`
- Shared layout with protected and public routes
- Role-based redirection and dashboard access
- API abstraction via `client/src/services/api.js`

### Backend architecture
- Express app in `server/src/app.js`
- API namespace: `/api`
- Route index in `server/src/routes/index.js`
- Mongoose models + controllers + middleware pattern

### Security model
- JWT bearer tokens
- Route-level `protect` middleware
- Role checks via `authorize`/role middleware
- Helmet, CORS allowlist, rate limiting

## 7. Implemented Functional Scope

### 7.1 Authentication and User Management
- Register/login/logout
- Forgot/reset password
- Email verification endpoints
- Profile update and password change
- Admin approval and role update workflows

### 7.2 Pet Profiles
- CRUD pet records
- Role-aware list behavior (owner/admin/vet visibility)
- Upload and remove pet photos

### 7.3 Medical and Vaccination
- Medical record CRUD
- Vet/admin creation and update controls
- Owner-limited read visibility for own pets
- Vaccination CRUD + reminders endpoint

### 7.4 Appointments
- Appointment booking and updates
- Provider listing and slot retrieval
- History endpoint

### 7.5 Marketplace
- Public product browsing and product detail
- Product reviews
- Order placement and order tracking
- Pet shop/admin operations for inventory and order decisions

### 7.6 Adoption (updated flow)
- Public adoption listings page (`/adoption`)
- Protected listing creation (`/dashboard/adoption`)
- Request modal with applicant details:
  - name, email, phone
  - address, home type, experience
  - message
- Listing owner sees request details and can approve/decline
- Request status lifecycle and listing status updates

### 7.7 Veterinarian Patients + Records (updated flow)
- Vet dashboard pulls all pet owners and pets (for vets)
- Grouped owner/pet patient view in vet dashboard
- Quick add medical-record modal per pet
- Direct navigation to filtered records (`/medical-records?petId=...`)
- Pet owners can view their own pets’ records

### 7.8 Community, Blogs, Messaging, Notifications
- Community posts/discussions with likes/comments and moderation routes
- Blogs with admin publishing controls
- Direct messaging conversations + read tracking
- Notifications listing and mark-read behavior

### 7.9 AI and Utility
- AI prediction endpoints (`/api/ai/...`)
- File upload endpoint (`/api/uploads`)

## 8. UI/UX Implementation Notes

- Modernized rebrand design system in `client/src/styles/rebrand.css`
- Rounded shell/card visual language and responsive layouts
- Dropdown/header/sidebar behavior improvements
- Dashboard-specific layout offsets and overlap fixes
- Robust image fallback pipeline:
  - `getUploadUrl` supports string/object/bare filename payloads
  - fallback asset: `client/public/placeholder.svg`
- Added local SVG illustrations for high-visibility sections so the app is not dependent on external image hotlinks

## 9. API Surface (Report View)

All endpoints are under `/api`.

### Auth (`/auth`)
- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /verify-email`
- `GET /me`
- `PUT /profile`
- `PUT /change-password`
- `POST /logout`
- `POST /resend-verification`
- Admin management: users, approvals, roles, stats

### Pets (`/pets`)
- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `POST /:id/photos`
- `POST /:id/photos/remove`

### Medical (`/medical-records`)
- `GET /`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### Vaccinations (`/vaccinations`)
- `GET /`
- `POST /`
- `PUT /:id`
- `DELETE /:id`
- `POST /reminders`

### Appointments (`/appointments`)
- `GET /`
- `GET /history`
- `GET /providers`
- `GET /slots`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`

### Market (`/market`)
- Public catalog and detail
- Product reviews
- Orders
- Shop dashboard/order/product/inventory actions

### Adoption (`/adoptions`)
- `GET /`
- `POST /`
- `POST /:id/requests`
- `PATCH /:id/requests/respond`
- `POST /:id/contact`

### Other modules
- `/community`
- `/blogs`
- `/messages`
- `/notifications`
- `/match`
- `/admin`
- `/ai`
- `/uploads`

## 10. Role and Permission Matrix (Implemented Behavior)

### Pet Owner
- Manage own pets
- View own medical records and vaccinations
- Book appointments
- Browse market and place orders
- Request adoption and messaging features

### Veterinarian
- Dashboard with schedules and patient directory
- See all pets for care operations
- Create/update medical records
- Appointment management

### Pet Shop
- Manage products/inventory
- Process orders
- Market dashboard operations

### Groomer
- Appointment/service-related workflow

### Admin
- User approvals/roles
- Cross-module moderation/management
- Analytics/report endpoints

## 11. Data Model Overview

Primary models used by implemented modules:
- `User`
- `Pet`
- `MedicalRecord`
- `Vaccination`
- `Appointment`
- `Product`
- `Order`
- `AdoptionPost`
- `Blog`
- `Discussion`
- `Message`
- `Notification`
- `Review`

## 12. Testing and Validation in This Repository

Current standard verification used during implementation:
- `npm run build` (client)
- Manual role-based UI checks
- API route/controller-level runtime checks

Note: there is currently no automated unit/integration test suite committed in this repository.

## 13. Demo Login Credentials

All demo accounts use the password `password123`.

| Role | Email |
|------|-------|
| Admin | `admin@petcare.demo` |
| Pet Owner | `nimal.owner@petcare.demo` |
| Pet Owner | `kavindi.owner@petcare.demo` |
| Pet Owner | `ruwan.owner@petcare.demo` |
| Veterinarian | `amara.vet@petcare.demo` |
| Veterinarian | `lahiru.vet@petcare.demo` |
| Pet Shop | `pawmart.shop@petcare.demo` |
| Groomer | `cuddle.groom@petcare.demo` |

## 14. Known Constraints / Future Improvements

- Add formal automated tests (unit + integration + e2e)
- Add pagination and stronger query controls to all list-heavy screens
- Add richer auditing and admin activity logs
- Improve validation/error messaging consistency across forms
- Add CI pipeline for lint/build/test gates

## 15. Documentation References

- `docs/API_REFERENCE.md`
- `docs/IMPLEMENTATION_STEPS.md`
- `docs/QUICK_START.md`
- `AUTHENTICATION_COMPLETE_GUIDE.md`
- `DASHBOARD_ARCHITECTURE.md`

---

If you are using this for a project report, recommended chapter order is:
1. Problem Statement
2. Objectives
3. Architecture
4. Module Implementation
5. Role-Based Flows
6. API Design
7. Security
8. Results and Validation
9. Limitations and Future Work
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT
- Bcryptjs

**DevOps**
- npm scripts
- Environment variables
- Concurrently (for running both servers)

### Environment Variables

Create `.env` in server directory:
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:5173
```

### npm Scripts

```bash
# Development
npm run dev              # Start both server and client
npm run server           # Start server only
npm run client           # Start client only

# Production
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run tests
npm run test:watch      # Watch mode
```

## 📚 Documentation

- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Detailed setup and feature roadmap
- [DASHBOARD_ARCHITECTURE.md](DASHBOARD_ARCHITECTURE.md) - Dashboard design and structure
- [API_REFERENCE.md](docs/API_REFERENCE.md) - Complete API documentation

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MONGO_URI in .env
- Ensure IP is whitelisted in MongoDB Atlas
- Check network connectivity

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
- Check CLIENT_URL in .env
- Ensure credentials: true in fetch requests
- Verify CORS middleware configuration

## 📋 Checklist for First Run

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Create .env file with MongoDB URI
- [ ] Start backend server (npm run server)
- [ ] Start frontend (npm run client)
- [ ] Open http://localhost:5173
- [ ] Test login with test credentials
- [ ] Verify dashboard loads correctly

## 🚦 Current Status

- ✅ Project structure setup
- ✅ Dashboard UI components
- ✅ Role-based routing
- ✅ Authentication hooks
- ✅ Utility functions
- ✅ Server middleware setup
- ✅ Comprehensive documentation
- ⏳ Backend role middleware integration
- ⏳ API endpoint implementation
- ⏳ Database integration
- ⏳ Advanced features (AI, maps, etc.)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact the development team
- Check documentation and FAQs

## 🎯 Roadmap

### v1.0 (Current)
- Core features and dashboards
- Basic authentication
- Pet profile management
- Appointment booking

### v2.0 (Planned)
- Advanced AI features
- Real-time notifications
- Mobile app
- Payment integration

### v3.0 (Future)
- IoT pet devices integration
- Advanced analytics
- Multi-language support
- API rate limiting enhancements

## ⭐ Star Us

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ for pet lovers**
