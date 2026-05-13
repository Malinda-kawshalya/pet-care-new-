# Quick Start Guide - Pet Care System

## 5 Minutes to Running

### Step 1: Prerequisites Check (1 min)
Make sure you have:
- Node.js installed (`node --version` should show v14+)
- MongoDB Atlas account (or local MongoDB)
- `.env.example` file exists in server folder

### Step 2: Install Dependencies (2 min)
```bash
# From project root
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Go back to root
cd ..
```

### Step 3: Configure Environment (1 min)
```bash
# Copy env file
cd server
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/petcare
```

### Step 4: Start Everything (1 min)
```bash
# From project root - this starts both backend and frontend
npm run dev
```

✅ **Done!** Open http://localhost:5173

---

## Common First Tasks

### Access Different Dashboards
After logging in, visit these URLs:
- Pet Owner: `http://localhost:5173/dashboard/petowner`
- Veterinarian: `http://localhost:5173/dashboard/vet`
- Pet Shop: `http://localhost:5173/dashboard/petshop`
- Groomer: `http://localhost:5173/dashboard/groomer`
- Admin: `http://localhost:5173/dashboard/admin`

### Test Login Credentials (Development)
```
Email: test@example.com
Password: password123
Role: petOwner
```

### View API Documentation
- [Complete API Reference](../docs/API_REFERENCE.md)
- Dashboard Architecture: [DASHBOARD_ARCHITECTURE.md](../DASHBOARD_ARCHITECTURE.md)
- Implementation Guide: [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)

---

## Project Structure Overview

```
pet-care-new/
├── client/              # React frontend (port 5173)
│   └── src/
│       ├── components/dashboards/  # Role dashboards
│       ├── hooks/                  # useAuth, useRole hooks
│       └── utils/                  # roleHelper, authHelper
│
├── server/              # Node backend (port 5000)
│   └── src/
│       ├── middleware/roleMiddleware.js
│       ├── utils/roleChecker.js
│       └── models/                 # Database schemas
│
└── docs/               # Documentation files
```

---

## Key Files Created

### Frontend
- `client/src/components/dashboards/PetOwnerDashboard.jsx`
- `client/src/components/dashboards/VetDashboard.jsx`
- `client/src/components/dashboards/PetShopDashboard.jsx`
- `client/src/components/dashboards/GroomerDashboard.jsx`
- `client/src/components/dashboards/AdminDashboard.jsx`
- `client/src/components/dashboards/Dashboard.css`
- `client/src/hooks/useAuth.js`
- `client/src/utils/roleHelper.js`
- `client/src/utils/authHelper.js`
- `client/src/utils/constants.js`

### Backend
- `server/src/middleware/roleMiddleware.js`
- `server/src/utils/roleChecker.js`

### Documentation
- `DASHBOARD_ARCHITECTURE.md` - Complete dashboard design
- `IMPLEMENTATION_GUIDE.md` - Step-by-step guide
- `docs/API_REFERENCE.md` - API endpoint documentation
- `README.md` - Updated with full project info

---

## Next Steps

### Immediate (Next Session)
1. [ ] Integrate dashboard components with API endpoints
2. [ ] Update User model with role field
3. [ ] Create dashboard data fetchers
4. [ ] Test role-based route protection

### Short Term
1. [ ] Implement pet management API
2. [ ] Build appointment booking system
3. [ ] Add medical records functionality
4. [ ] Set up product marketplace

### Medium Term
1. [ ] Implement notifications
2. [ ] Add real-time features with Socket.io
3. [ ] Integrate payment processing
4. [ ] Add file uploads for documents/images

### Long Term
1. [ ] AI/ML features (vaccination prediction)
2. [ ] Google Maps integration
3. [ ] Mobile app development
4. [ ] Advanced analytics

---

## Troubleshooting

### Port 5000/5173 already in use?
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### MongoDB connection fails?
- Check MONGO_URI in .env
- Whitelist your IP in MongoDB Atlas
- Verify connection string format

### Modules not found?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## File Structure After Setup

```
pet-care-new/
├── .env (created from .env.example)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboards/ ✅ NEW
│   │   ├── hooks/ ✅ NEW
│   │   └── utils/ ✅ UPDATED
│   └── node_modules/ (generated)
├── server/
│   ├── src/
│   │   ├── middleware/roleMiddleware.js ✅ NEW
│   │   └── utils/roleChecker.js ✅ NEW
│   ├── .env ✅ NEW
│   └── node_modules/ (generated)
├── docs/
│   ├── API_REFERENCE.md ✅ NEW
│   └── IMPLEMENTATION_STEPS.md
├── DASHBOARD_ARCHITECTURE.md ✅ NEW
├── IMPLEMENTATION_GUIDE.md ✅ NEW
└── README.md ✅ UPDATED
```

---

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Start everything
npm run server           # Start backend only
npm run client           # Start frontend only

# Database
# MongoDB Atlas: Use connection string in .env

# Testing
curl http://localhost:5000   # Test backend
# Open http://localhost:5173 in browser

# Debugging
# Check backend: http://localhost:5000/api
# Check frontend: http://localhost:5173
```

---

## Resources

- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **JWT Guide**: https://jwt.io
- **Vite Guide**: https://vitejs.dev

---

## Support

- Check [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) for detailed explanations
- Review [API_REFERENCE.md](../docs/API_REFERENCE.md) for endpoint details
- See [DASHBOARD_ARCHITECTURE.md](../DASHBOARD_ARCHITECTURE.md) for design docs

---

**Now you're ready to start developing! 🚀**

