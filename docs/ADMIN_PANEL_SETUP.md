# 🎛️ Admin Panel Setup Guide

## Overview

A complete admin panel has been created in the `admin/` folder to manage hotels and medical services in your database.

## Quick Start

### Step 1: Install Admin Dependencies

```powershell
cd admin
npm install
```

### Step 2: Start Admin Panel

```powershell
# Add Node.js to PATH if needed
$env:PATH += ";C:\Program Files\nodejs"

# Start admin panel
npm run dev
```

Admin panel will run on: **http://localhost:5174**

### Step 3: Login

- **Username:** `admin`
- **Password:** `admin123`

## What's Included

### ✅ Frontend (Admin Panel)
- Dashboard with statistics
- Hotel management (Add, Edit, Delete)
- Medical Services management (Add, Edit, Delete)
- Modern UI with Tailwind CSS
- Simple authentication

### ✅ Backend (API Routes)
- `GET /api/admin/hotels` - List all hotels
- `POST /api/admin/hotels` - Create hotel
- `PUT /api/admin/hotels/:id` - Update hotel
- `DELETE /api/admin/hotels/:id` - Delete hotel
- Same routes for `/api/admin/medical`

## Project Structure

```
KumbhSahyogi-1jsx/
├── admin/                    # Admin Panel (NEW)
│   ├── src/
│   │   ├── components/       # Layout, etc.
│   │   ├── pages/           # Dashboard, Hotels, MedicalServices, Login
│   │   ├── hooks/           # useAuth hook
│   │   └── lib/             # API client
│   ├── package.json
│   └── vite.config.ts
├── client/                   # Main frontend
├── server/                   # Backend
│   └── routes/
│       └── admin/           # Admin API routes (NEW)
│           ├── hotels.js
│           └── medical.js
└── ...
```

## Running All Services

You need **3 terminals** running:

### Terminal 1: Backend Server
```powershell
cd server
$env:PATH += ";C:\Program Files\nodejs"
npm start
```
Runs on: http://localhost:4000

### Terminal 2: Main Frontend
```powershell
cd KumbhSahyogi-1jsx
$env:PATH += ";C:\Program Files\nodejs"
npm run dev
```
Runs on: http://localhost:5173

### Terminal 3: Admin Panel
```powershell
cd admin
$env:PATH += ";C:\Program Files\nodejs"
npm run dev
```
Runs on: http://localhost:5174

## Features

### Hotel Management
- ✅ View all hotels in a table
- ✅ Add new hotels with full details
- ✅ Edit existing hotels
- ✅ Delete hotels
- ✅ Form validation
- ✅ Location coordinates (lat/lng) for geospatial search

### Medical Services Management
- ✅ View all medical services
- ✅ Add new medical services
- ✅ Edit existing services
- ✅ Delete services
- ✅ Support for emergency services and 24/7 flags

### Dashboard
- ✅ Statistics overview
- ✅ Quick access to management pages

## Usage Example

### Adding a Hotel:

1. Open admin panel: http://localhost:5174
2. Login with `admin` / `admin123`
3. Go to **Hotels** page
4. Click **Add Hotel**
5. Fill in:
   - Name: "Hotel Example"
   - Address: "123 Main St, Nashik"
   - Price: 2500
   - Rating: 4.5
   - Latitude: 19.9975
   - Longitude: 73.7898
   - (Other fields optional)
6. Click **Add Hotel**

The hotel will immediately appear in your main frontend!

## Notes

- **Backend must be running** for admin panel to work
- **MongoDB must be connected**
- Authentication is basic (for production, implement JWT)
- Location coordinates are required for hotels/services to appear in nearby searches

## Troubleshooting

### Admin panel shows "Failed to fetch"
- Make sure backend server is running on port 4000
- Check browser console for errors

### Can't login
- Default credentials: `admin` / `admin123`
- Check browser console for errors

### Hotels not saving
- Check backend terminal for error messages
- Verify MongoDB is connected
- Check that all required fields are filled

## Next Steps

For production, consider:
- Implementing JWT authentication
- Adding role-based access control
- Adding image upload functionality
- Adding bulk import/export
- Adding audit logs

