# 🚀 Quick Start Guide

## Current Status
✅ Dependencies installed  
✅ Environment configured  
✅ npm function ready  

## Start the Project (Choose One Method)

### Method 1: Use the Start Script (Easiest)

1. Open PowerShell in the project folder:
   ```powershell
   cd C:\Users\Aditya\OneDrive\Desktop\KumbhSahyogi-1jsx\KumbhSahyogi-1jsx
   ```

2. Run the start script:
   ```powershell
   .\start-servers.ps1
   ```

   This will open two separate PowerShell windows - one for backend, one for frontend.

### Method 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Navigate to project
cd C:\Users\Aditya\OneDrive\Desktop\KumbhSahyogi-1jsx\KumbhSahyogi-1jsx\server

# Start backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Navigate to project
cd C:\Users\Aditya\OneDrive\Desktop\KumbhSahyogi-1jsx\KumbhSahyogi-1jsx

# Start frontend
npm run dev
```

### Method 3: Permanent Fix (One-time - Recommended!)

To make npm and node work permanently:

1. **Add Node.js to PATH permanently:**
   ```powershell
   # Run as Administrator (Right-click PowerShell > Run as Administrator)
   cd C:\Users\Aditya\OneDrive\Desktop\KumbhSahyogi-1jsx\KumbhSahyogi-1jsx
   .\setup-path.ps1
   ```
   Or manually:
   - Open System Properties > Environment Variables
   - Add `C:\Program Files\nodejs` to User PATH

2. **Fix PowerShell execution policy:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Restart PowerShell**
4. Now `npm` and `node` will work directly!

## Access the Application

Once both servers are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

## Troubleshooting

### npm/node still not working?
- Add to PATH for current session: `$env:PATH += ";C:\Program Files\nodejs"`
- Use full path: `& "C:\Program Files\nodejs\npm.cmd" <command>`
- Run `.\setup-path.ps1` as Administrator to fix permanently

### Port already in use?
- Backend: Change `PORT` in `server/.env`
- Frontend: Change port in `vite.config.ts`

### MongoDB connection error?
- Check `server/.env` file
- Verify MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas

## Need Help?

Check `SETUP_COMPLETE.md` for detailed setup information.

