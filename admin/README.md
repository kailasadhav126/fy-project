# Kumbh Sahyogi - Admin Panel

Admin panel for managing hotels and medical services in the Kumbh Sahyogi database.

## Features

- ✅ Dashboard with statistics
- ✅ Hotel Management (Add, Edit, Delete)
- ✅ Medical Services Management (Add, Edit, Delete)
- ✅ Simple authentication
- ✅ Modern UI with Tailwind CSS

## Setup

### 1. Install Dependencies

```powershell
cd admin
npm install
```

### 2. Start Development Server

```powershell
# Make sure Node.js is in PATH
$env:PATH += ";C:\Program Files\nodejs"

# Start admin panel
npm run dev
```

The admin panel will run on: **http://localhost:5174**

### 3. Login

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable components
│   │   └── Layout.jsx  # Main layout with sidebar
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Hotels.jsx
│   │   ├── MedicalServices.jsx
│   │   └── Login.jsx
│   ├── hooks/          # Custom hooks
│   │   └── useAuth.js  # Authentication hook
│   ├── lib/            # Utilities
│   │   └── api.js      # API client
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API Endpoints

The admin panel uses these backend endpoints:

### Hotels
- `GET /api/admin/hotels` - Get all hotels
- `GET /api/admin/hotels/:id` - Get single hotel
- `POST /api/admin/hotels` - Create hotel
- `PUT /api/admin/hotels/:id` - Update hotel
- `DELETE /api/admin/hotels/:id` - Delete hotel

### Medical Services
- `GET /api/admin/medical` - Get all medical services
- `GET /api/admin/medical/:id` - Get single medical service
- `POST /api/admin/medical` - Create medical service
- `PUT /api/admin/medical/:id` - Update medical service
- `DELETE /api/admin/medical/:id` - Delete medical service

## Usage

### Adding a Hotel

1. Go to **Hotels** page
2. Click **Add Hotel** button
3. Fill in the form:
   - Name (required)
   - Address (required)
   - Price (required)
   - Rating (required)
   - Latitude & Longitude (required for location)
   - Other optional fields
4. Click **Add Hotel**

### Editing a Hotel

1. Go to **Hotels** page
2. Click the **Edit** icon (pencil) next to the hotel
3. Modify the fields
4. Click **Update Hotel**

### Deleting a Hotel

1. Go to **Hotels** page
2. Click the **Delete** icon (trash) next to the hotel
3. Confirm deletion

Same process applies for Medical Services.

## Requirements

- Backend server must be running on `http://localhost:4000`
- MongoDB must be connected
- Node.js must be installed

## Build for Production

```powershell
npm run build
```

The built files will be in the `dist/` folder.

## Notes

- Authentication is currently basic (username/password check)
- For production, implement proper JWT authentication
- All API calls require the backend to be running
- Location coordinates are required for hotels and medical services to appear in nearby searches

