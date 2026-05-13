# Pet Care — Smart Pet Health Management and Service Platform (MERN)

Developer Guide & README

This repository contains the implementation plan and developer guide for "Pet Care" — a MERN (MongoDB, Express, React, Node.js) web and mobile-ready platform to manage pet health records, appointments, marketplace, and social features (Find a Mate, adoption, blog).

This README is the canonical developer guide: setup, architecture, API surface, data models, environment variables, development workflows, testing, and deployment instructions.

---

## Project Overview

- Goals: centralized pet medical records, automated reminders, appointment bookings, marketplace, responsible breeding matchmaking, community content, and admin verification workflows.
- Tech stack (recommended):
  - Frontend: React (CRA or Vite) with React Router, Redux/Context for state
  - Backend: Node.js + Express
  - Database: MongoDB (Atlas or local) via Mongoose
  - Auth: JWT for API + refresh tokens; OAuth optional for providers
  - Notifications: Firebase Cloud Messaging (FCM) for mobile/web push
  - Storage: AWS S3 / Cloudinary for images
  - DevOps: Vercel (frontend) + Heroku / Render / Railway (backend) or containerized Docker + Kubernetes

## Repository layout (recommended)

- `/backend` — Express API, Mongoose models, routes, services, cron jobs
- `/frontend` — React app (web) and shared UI components for RN if needed
- `/scripts` — helper scripts (DB seeding, migrations)
- `/docs` — API docs, ER diagrams, design notes
- `/ml` — prototype notebooks or small services for predictive reminders

> Note: adjust structure if you prefer a monorepo with `pnpm` workspaces or separate repos.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB (Atlas account or local installation)
- Firebase project (for FCM) — optional at start
- AWS account (S3) or Cloudinary for image storage — optional

## Environment variables (example `.env`)

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/petcare?retryWrites=true&w=majority
JWT_SECRET=supersecret_jwt_key
JWT_REFRESH_SECRET=another_refresh_secret
S3_BUCKET=your-bucket
S3_KEY=AKIA...
S3_SECRET=...
FCM_SERVER_KEY=...
CLIENT_URL=http://localhost:3000
```

## Quick local development (high-level)

1. Clone repo
2. Fill `.env` files in `/backend` and `/frontend` (if applicable)
3. Install dependencies in both packages

Backend (from repo root):
```bash
cd backend
npm install
npm run dev   # starts nodemon / ts-node-dev or node with watch
```

Frontend:
```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` for frontend and `http://localhost:4000/api` for backend.

## Backend: API design (core endpoints)

Auth & Users
- `POST /api/auth/register` — register user (owner, vet, business) (body: name, email, password, role)
- `POST /api/auth/login` — returns access token + refresh token
- `POST /api/auth/refresh` — refresh access token
- `GET /api/users/me` — profile
- `PUT /api/users/:id` — update profile

Pets & Profiles
- `POST /api/pets` — create pet profile (owner-only)
- `GET /api/pets/:id` — get pet details
- `PUT /api/pets/:id` — update pet
- `DELETE /api/pets/:id` — delete pet

Medical Records & Vaccinations
- `POST /api/pets/:petId/records` — add medical record (visit, vaccine, medication)
- `GET /api/pets/:petId/records` — list records
- `POST /api/pets/:petId/vaccination-schedule` — schedule recurring reminders

Appointments
- `POST /api/appointments` — book appointment (service type, provider, datetime)
- `GET /api/appointments?userId=` — list user appointments
- `PUT /api/appointments/:id` — update status (reschedule, cancel)

Marketplace
- `GET /api/products` — list
- `POST /api/products` — create product (seller)
- `POST /api/orders` — place order

Find a Mate
- `GET /api/match?breed=&location=&age=` — search matches
- `POST /api/match/request` — request introduction

Blog & Adoption
- `GET /api/posts`, `POST /api/posts` (admin or vets), `GET /api/adoptions`, `POST /api/adoptions`

Admin
- `GET /api/admin/users/pending` — list pending verification
- `POST /api/admin/users/:id/verify` — verify account

Notifications
- `POST /api/notifications/push` — trigger push via FCM

Health & Audit
- `GET /api/health` — simple health check

## Data models (high-level)

- User: { _id, name, email, passwordHash, role: [owner, vet, shop, admin], verified, profile, location }
- Pet: { _id, ownerId, name, species, breed, dob, gender, photos, medicalSummary }
- MedicalRecord: { _id, petId, type, title, description, date, vetId, attachments }
- Vaccination: { petId, vaccineName, dateGiven, nextDue, reminderRule }
- Appointment: { userId, petId, providerId, serviceType, datetime, status }
- Product: { sellerId, name, priceLKR, currency, stock, images, category }
- Order: { buyerId, items: [{productId, qty}], total, status, shipping }
- MatchProfile: { petId, breed, age, location, verifiedBreeder }
- BlogPost / Adoption: typical CMS fields

Design notes:
- Use references for relations and denormalize small summaries (e.g., pet name in appointment) for faster reads.
- Add indexes on `userId`, `petId`, `location` and searchable fields.

## Reminders & Background jobs

- Use a job queue (BullMQ / Redis) or scheduled cron jobs for:
  - Vaccination reminders (schedule jobs when record created/updated)
  - Appointment reminders (24h, 1h before)
  - Email digests

- For production use, run worker processes that consume jobs and call FCM / email / SMS gateways.

## Authentication & Security

- Hash passwords with `bcrypt` (or `argon2`).
- Use short-lived access tokens (15m) + refresh tokens stored securely.
- Implement role-based access control (RBAC): `owner`, `vet`, `shop`, `admin`.
- Validate and sanitize inputs to prevent injection attacks.
- Rate-limit public endpoints and protect sensitive endpoints.

## File uploads & media

- Accept images for pet profiles, product images, and attachments.
- Validate file types and sizes.
- Offload to S3/Cloudinary and store secure URLs and metadata in DB.

## Frontend: important pages & components

- Auth: Login, Register, Forgot Password
- Dashboard (owner): pets list, upcoming reminders, recent records
- Pet profile: records, vaccination schedule, photos
- Appointments: search providers, booking flow, calendar view
- Marketplace: categories, product page, cart and checkout
- Find a Mate: search, filters, request flow, safety guidelines
- Blog & Adoption: article list and CMS editor
- Admin panel: user verification, content moderation

Best practices:
- Use component library (Material UI, AntD) for consistent UI and accessibility.
- Keep API client code in a single module (e.g., `api/` folder) and centralize auth token handling.

## Machine Learning / Predictive reminders (prototype)

- Start with a lightweight model: heuristic + logistic regression using historical records (e.g., missed appointments, disease seasonality) to flag higher-risk pets.
- Data sources: vaccination history, region, pet age, species.
- Implement ML as a separate microservice or scheduled job in `/ml`.

## Testing

- Backend: Jest + Supertest for unit and integration tests.
- Frontend: Jest + React Testing Library for components.
- E2E: Playwright or Cypress for user flows (booking, checkout, login).

Scripts (examples in `package.json`)
```json
{
  "start": "node dist/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest --coverage"
}
```

## CI/CD

- Use GitHub Actions to run tests, lint, build artifacts.
- Build & deploy frontend to Vercel; backend to Render/Heroku.
- Store secrets in environment variables/secrets manager.

## Deployment checklist

- Configure MongoDB Atlas with production cluster and IP access rules.
- Configure S3 bucket / Cloudinary and CORS rules.
- Set up FCM production credentials.
- Configure domain, HTTPS, and monitoring (Sentry, Prometheus).

## Accessibility and Localization

- Plan for i18n early: include `react-intl` or `i18next` to support English, Sinhala, Tamil.
- Keep UI accessible (WCAG basics), large fonts, clear CTAs for all ages.

## Data privacy & compliance

- Design retention policies for medical data.
- Allow users to export and delete their data.

## Suggested implementation milestones (mapped to TODOs)

1. Initialize monorepo, basic backend API, and basic frontend layout.
2. Authentication flows and user/pet CRUD.
3. Medical records & reminders with a simple job queue.
4. Appointment booking and provider listings.
5. Marketplace MVP (list, create, order).
6. Find a Mate MVP with safety/verification workflow.
7. Blog, adoption, admin panel.
8. ML prototype for predictive reminders.
9. Testing, CI, and deployment.

## Helpful dev tips

- Seed initial data with scripts (`scripts/seed.js`).
- Keep secrets out of the repo; use `.env` locally and secret management in CI.
- Start with simple, well-tested APIs before adding real-time features.

## Next steps I can do for you

- Scaffold the repository (backend + frontend) with initial package.json files and basic server/client skeletons.
- Implement authentication and user/pet models.
- Create API documentation (OpenAPI / Swagger) and seed scripts.

If you want, I can now scaffold the project structure and implement the backend skeleton next.

---

Prepared by: Developer guide generator
