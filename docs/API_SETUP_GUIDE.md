# API Setup Guide for Kumbh Sahyogi

This document lists all the APIs required for the project and provides step-by-step instructions on how to obtain them.

## Required APIs

### 1. Google Maps JavaScript API

**Purpose:** 
- Display interactive maps
- Get user location
- Show routes to Nashik
- Display nearby places (hotels, medical services, parking)
- Navigation and directions

**How to Get:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "Kumbh Sahyogi"
   - Click "Create"

3. **Enable Required APIs:**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - **Maps JavaScript API** (Required for maps)
     - **Places API** (Required for place search)
     - **Directions API** (Required for route calculation)
     - **Geocoding API** (Required for address conversion)
     - **Geolocation API** (Required for user location)

4. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. **Restrict API Key (Recommended for Production):**
   - Click on the created API key to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your domain: `localhost:5173` (for development)
     - Add production domain: `yourdomain.com`
   - Under "API restrictions":
     - Select "Restrict key"
     - Select only the APIs you enabled above
   - Click "Save"

6. **Add API Key to Project:**
   - Open `client/src/pages/transport-road.jsx`
   - Find line 43: `const apiKey = 'YOUR_API_KEY_HERE';`
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - **Note:** For production, use environment variables

**Pricing:**
- First $200/month in credits (free)
- Maps JavaScript API: $7 per 1,000 loads
- Directions API: $5 per 1,000 requests
- Geocoding API: $5 per 1,000 requests

**Free Tier:** Yes, up to $200/month credit

---

### 2. Geolocation API (Browser API)

**Purpose:**
- Get user's real-time location
- Calculate distances to nearby places
- Show nearby hotels, medical services, parking

**How to Get:**

**This is a browser API - no key required!**

The Geolocation API is built into modern browsers:
- Chrome, Firefox, Safari, Edge all support it
- No API key needed
- Free to use

**Usage:**
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
  }
);
```

**Note:**
- Requires HTTPS in production (localhost works for development)
- User must grant location permission
- May not work in some browsers if location is disabled

---

### 3. CSV Data Files (Already Created)

**Purpose:**
- Store hotel data
- Store medical services data
- Store parking data

**Location:**
- Hotels: `client/public/data/hotels_nashik.csv`
- Medical Services: `client/public/data/medical_services_nashik.csv`
- Parking: `client/public/data/parking_nashik.csv`

**How to Update:**
- Open the CSV files in Excel, Google Sheets, or any text editor
- Add/remove/edit entries as needed
- Save the file
- The application will automatically load the updated data

**No API Required** - These are static files served from the public folder

---

## Environment Variables Setup

For production, use environment variables for API keys:

1. **Create `.env` file in project root:**
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. **Update code to use environment variable:**
```javascript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

3. **Add `.env` to `.gitignore`** (Never commit API keys to Git!)

---

## Summary of All APIs Needed

| API Name | Type | Required Key | Free Tier | Cost |
|----------|------|--------------|-----------|------|
| Google Maps JavaScript API | External | Yes | Yes ($200/month) | $7/1K loads |
| Google Places API | External | Yes | Yes ($200/month) | $17/1K requests |
| Google Directions API | External | Yes | Yes ($200/month) | $5/1K requests |
| Google Geocoding API | External | Yes | Yes ($200/month) | $5/1K requests |
| Geolocation API | Browser | No | Yes | Free |
| CSV Data Files | Local | No | Yes | Free |

---

## Quick Setup Checklist

- [ ] Create Google Cloud account
- [ ] Create new project in Google Cloud Console
- [ ] Enable Maps JavaScript API
- [ ] Enable Places API
- [ ] Enable Directions API
- [ ] Enable Geocoding API
- [ ] Create API key
- [ ] Restrict API key (recommended)
- [ ] Add API key to `transport-road.jsx`
- [ ] Test API key in application
- [ ] Set up environment variables for production
- [ ] Add `.env` to `.gitignore`

---

## Troubleshooting

### API Key Not Working
- Check if APIs are enabled in Google Cloud Console
- Verify API key is correct (no extra spaces)
- Check browser console for error messages
- Verify API key restrictions allow your domain

### Maps Not Loading
- Check internet connection
- Verify API key is valid
- Check browser console for errors
- Ensure Maps JavaScript API is enabled

### Location Not Working
- Check if user granted location permission
- Verify HTTPS is enabled (required in production)
- Check browser location settings
- Ensure Geolocation API is supported by browser

### CORS Errors
- Google Maps APIs handle CORS automatically
- If you see CORS errors, check API key restrictions
- Ensure referrer restrictions include your domain

---

## Support

For Google Maps API issues:
- Documentation: https://developers.google.com/maps/documentation
- Support: https://developers.google.com/maps/support

For Geolocation API issues:
- Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API

