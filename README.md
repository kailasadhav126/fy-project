# 🕉️ KumbhSahyogi - Kumbh Mela Services Platform

A comprehensive platform for Kumbh Mela services including hotel bookings, parking, medical facilities, transport options, and emergency services.

## 📁 Project Structure

```
KumbhSahyogi/
├── client/          # Frontend - User Website (React + Vite)
├── server/          # Backend - API Server (Node.js + Express + MongoDB)
└── admin/           # Frontend - Admin Panel (React + Vite)
  Email: admin@kumbhsahyogi.com
  Password: admin123
```

## ✨ Features

- 🏨 Hotel Booking System
- 🚗 Parking Space Management
- 🏥 Medical Services Directory
- 🚌 Transport Options
- 🆘 Emergency Services
- 🌐 Multi-language Support (English/Hindi)
- 📱 Responsive Design
- 👨‍💼 Admin Panel for Management

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd KumbhSahyogi
```

2. **Install dependencies for all folders**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install admin dependencies
cd ../admin
npm install
```

3. **Set up environment variables**

Server (.env in `server/` folder):
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/kumbhsahyogi
```

Client (.env in `client/` folder):
```env
VITE_API_BASE=http://localhost:4000
```

Admin (.env in `admin/` folder):
```env
VITE_API_BASE=http://localhost:4000
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run all services**

**Option 1: Use the batch file (Windows)**
```bash
start-all.bat
```

**Option 2: Manual start (3 separate terminals)**

Terminal 1 - Server:
```bash
cd server
npm run dev
```

Terminal 2 - Client:
```bash
cd client
npm run dev
```

Terminal 3 - Admin:
```bash
cd admin
npm run dev
```

## 🌐 Access the Applications

After starting all services:

| Application | URL | Description |
|------------|-----|-------------|
| **Client Website** | http://localhost:5173 | User-facing website |
| **Admin Panel** | http://localhost:5174 | Admin management panel |
| **Backend API** | http://localhost:4000 | REST API server |

## 🔐 Admin Login

Default credentials:
- **Email**: admin@kumbhsahyogi.com
- **Password**: admin123

## 🛠️ Tech Stack

### Client & Admin
- React 18
- Vite
- TailwindCSS
- Radix UI Components
- Wouter (Routing)
- React Hook Form
- Zod (Validation)

### Server
- Node.js
- Express
- MongoDB + Mongoose
- CORS enabled
- RESTful API

## 📂 Folder Details

### `/client` - User Website
Main user-facing application where visitors can:
- Search and book hotels
- Find parking spaces
- Locate medical services
- View transport options
- Access emergency services

### `/server` - Backend API
Express server that handles:
- Database operations (MongoDB)
- API endpoints for hotels, parking, medical services
- Data validation
- CORS configuration

### `/admin` - Admin Panel
Management interface for administrators to:
- Add/edit/delete hotels
- Manage parking spaces
- Update medical services
- View dashboard analytics

## 📡 API Endpoints

### Public APIs
```
GET  /api/hotels              - Get all hotels
GET  /api/hotels/nearby       - Get nearby hotels
GET  /api/parking             - Get all parking spaces
GET  /api/parking/nearby      - Get nearby parking
GET  /api/medical             - Get all medical services
GET  /api/medical/nearby      - Get nearby medical services
```

### Admin APIs (Protected)
```
POST   /api/admin/login       - Admin login
GET    /api/admin/hotels      - Get all hotels
POST   /api/admin/hotels      - Create hotel
PUT    /api/admin/hotels/:id  - Update hotel
DELETE /api/admin/hotels/:id  - Delete hotel
```

## 🐛 Troubleshooting

### Port already in use
Change the port in respective `.env` files

### Cannot connect to MongoDB
1. Make sure MongoDB is installed
2. Start MongoDB: `mongod`
3. Check connection string in `server/.env`

### Module not found
Run `npm install` in the specific folder (client/server/admin)

### CORS errors
Ensure all `.env` files have correct API URLs

## 📝 Development Commands

### Server
```bash
cd server
npm run dev          # Start development server
npm run seed         # Seed database with sample data
```

### Client
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Admin
```bash
cd admin
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built for Kumbh Mela 2025 to help pilgrims and visitors access essential services.

---

**For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)**
