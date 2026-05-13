# Pet Care Smart Platform 🐾

A comprehensive MERN stack web application for managing all aspects of pet care, featuring role-based dashboards for different user types including pet owners, veterinarians, pet shop owners, groomers, and administrators.

## 🌟 Key Features

### User Roles & Dashboards
- **Pet Owner Dashboard**: Manage pets, track health records, book appointments, shop products, find matches
- **Veterinarian Dashboard**: Manage patient appointments, medical records, prescriptions, and availability
- **Pet Shop Owner Dashboard**: Inventory management, order processing, sales analytics, customer reviews
- **Groomer Dashboard**: Schedule management, service pricing, portfolio, customer feedback
- **Admin Dashboard**: User management, content moderation, system analytics, account approvals

### Core Features
- 🐕 **Pet Profile Management** - Add and manage multiple pets with complete health history
- 💊 **Medical Records & Vaccinations** - Track health records, vaccines, and set reminders
- 📅 **Appointment Booking** - Book veterinary, grooming, and training appointments
- 🛒 **Marketplace** - Browse and purchase pet products
- 💑 **Pet Matching** - Find compatible pets for breeding or companionship
- 🏠 **Adoption System** - List and search for adoption opportunities
- 📚 **Community & Blog** - Share experiences and access pet care tips
- 🔔 **Notifications** - Automated reminders for vaccinations and appointments
- 🔐 **Security** - JWT authentication, role-based access control, data encryption

### Advanced Features (Roadmap)
- 🤖 AI-powered vaccination prediction and health risk alerts
- 📍 Google Maps integration for nearby services
- 💬 Real-time messaging with service providers
- 🆘 Emergency SOS system
- 📸 QR code medical profile access
- 🎯 Personalized recommendations
- 📱 Mobile app adaptation

## 🏗️ Project Structure

```
pet-care-new/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── dashboards/       # Role-specific dashboards
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # CSS styling
│   └── package.json
│
├── server/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── docs/                      # Documentation
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── DASHBOARD_ARCHITECTURE.md
│   └── API_REFERENCE.md
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pet-care-new
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Install frontend dependencies**
```bash
cd ../client
npm install
```

### Configuration

1. **Create `.env` file in server directory**
```bash
cd server
cp .env.example .env
```

2. **Update `.env` with your credentials**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/petcare
JWT_SECRET=your_very_long_and_secure_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Running the Application

**Development Mode (from project root)**
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173) concurrently.

**Or run separately:**

Terminal 1 - Backend:
```bash
cd server
npm start
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

### Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- API Health Check: [http://localhost:5000](http://localhost:5000)

## 📊 User Types & Permissions

| Role | Permissions | Dashboard |
|------|-------------|-----------|
| **Pet Owner** | View pets, book appointments, shop, medical records | ✅ Custom dashboard |
| **Veterinarian** | Manage patients, appointments, records | ✅ Custom dashboard |
| **Pet Shop Owner** | Manage inventory, orders, analytics | ✅ Custom dashboard |
| **Groomer** | Manage appointments, services, portfolio | ✅ Custom dashboard |
| **Admin** | User management, moderation, analytics | ✅ Custom dashboard |

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Server returns JWT token
3. Token stored in localStorage
4. Token sent with every request via Authorization header
5. Backend validates token and user role

### Example Login
```javascript
// POST /api/auth/login
{
  "email": "owner@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "role": "petOwner",
    "email": "owner@example.com"
  }
}
```

## 🗄️ Database Models

The application uses MongoDB with the following main models:

- **User** - User accounts with role-based access
- **Pet** - Pet profiles with owner references
- **MedicalRecord** - Health records and medical history
- **Appointment** - Veterinary, grooming, training bookings
- **Product** - Marketplace products
- **Order** - Customer orders
- **MatchRequest** - Pet matching/breeding requests
- **AdoptionPost** - Pet adoption listings
- **Blog** - Community blog posts
- **Message** - Direct messaging
- **Notification** - System notifications
- **Review** - Product and service reviews

## 📱 API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/profile         - Get user profile
PUT    /api/auth/profile         - Update profile
POST   /api/auth/change-password - Change password
```

### Dashboards
```
GET    /api/dashboard/petowner   - Pet owner dashboard data
GET    /api/dashboard/vet        - Veterinarian dashboard data
GET    /api/dashboard/petshop    - Pet shop dashboard data
GET    /api/dashboard/groomer    - Groomer dashboard data
GET    /api/dashboard/admin      - Admin dashboard data
```

### Resources
```
GET    /api/pets                 - Get user's pets
POST   /api/pets                 - Create pet
PUT    /api/pets/:id             - Update pet
DELETE /api/pets/:id             - Delete pet

GET    /api/appointments         - Get appointments
POST   /api/appointments         - Book appointment
PUT    /api/appointments/:id     - Update appointment

GET    /api/medical-records      - Get medical records
POST   /api/medical-records      - Add medical record

GET    /api/products             - Browse products
POST   /api/orders               - Create order
```

### Admin
```
GET    /api/admin/users          - Get all users
PUT    /api/admin/users/:id/approve - Approve user
PUT    /api/admin/users/:id/block   - Block user
```

For complete API documentation, see [API_REFERENCE.md](docs/API_REFERENCE.md)

## 🔧 Development

### Technologies Used

**Frontend**
- React 18+
- React Router v6
- Vite (build tool)
- Fetch API
- CSS3

**Backend**
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
