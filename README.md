# Pet Care - Smart Pet Health Management and Service Platform

MERN stack application foundation for a complete pet care platform with an attractive modern UI inspired by the provided Happy Pet reference design.

## What Is Included

- React + Vite frontend in `client`
- Express + MongoDB + Mongoose backend in `server`
- Authentication foundation with JWT, roles, profile update, and admin approval status
- Database models for users, pets, medical records, vaccinations, appointments, products, orders, match requests, adoption posts, blogs, notifications, reviews, and messages
- API routes for all major project modules
- Admin analytics and account approval endpoints
- AI placeholder endpoints for vaccination prediction and health risk scoring
- Responsive landing page, module pages, dashboard, and auth UI
- Step-by-step implementation guide in `docs/IMPLEMENTATION_STEPS.md`

## Folder Structure

```text
pet-care-new-
+-- client
|   +-- src
|   |   +-- components
|   |   +-- data
|   |   +-- pages
|   |   +-- services
|   |   +-- styles
|   +-- package.json
+-- server
|   +-- src
|   |   +-- config
|   |   +-- controllers
|   |   +-- middleware
|   |   +-- models
|   |   +-- routes
|   |   +-- utils
|   +-- package.json
+-- docs
+-- package.json
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB local server or MongoDB Atlas database

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Frontend URL: `http://localhost:5173`

Backend URL: `http://localhost:5000`

## Environment Variables

Create `.env` from `.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/pet-care-smart
JWT_SECRET=replace_with_a_long_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Main Modules

- Authentication Module: login, register, verification, roles, approvals
- Pet Management Module: pet profiles, images, vaccination status, medical history
- Health Management Module: medical records, prescriptions, vet notes, vaccination reminders
- Appointment Module: vet, grooming, and training bookings
- Marketplace Module: products, cart, checkout, reviews, inventory
- Matchmaking Module: Find a Mate profiles, requests, safety reports
- Adoption Module: adoption posts, requests, approvals
- Community Module: blogs, comments, discussions, content moderation
- Notification Module: vaccination, appointment, promotion, emergency, email, and push alerts
- Location Module: nearby vets, groomers, pet shops, map display, navigation
- Admin Module: users, products, appointments, analytics, reports
- AI Module: vaccination prediction, health risk scoring, recommendations
- Security Module: auth, authorization, secure payments, backups, verification, fraud detection

## Development Roadmap

Open `docs/IMPLEMENTATION_STEPS.md` for the module-by-module implementation plan.
