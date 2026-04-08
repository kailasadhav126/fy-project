# 🔧 Permanent Node.js PATH Fix

## Option 1: Add to System PATH (Recommended - Permanent)

This adds Node.js to your system PATH permanently, so it works in all PowerShell windows.

### Steps:

1. **Open System Environment Variables:**
   - Press `Win + R`
   - Type: `sysdm.cpl` and press Enter
   - Click **"Advanced"** tab
   - Click **"Environment Variables"** button

2. **Edit User PATH:**
   - Under **"User variables"**, find **"Path"**
   - Click **"Edit"**
   - Click **"New"**
   - Add: `C:\Program Files\nodejs`
   - Click **"OK"** on all dialogs

3. **Restart PowerShell:**
   - Close all PowerShell windows
   - Open a new PowerShell window
   - Test: `node --version` (should work!)

## Option 2: PowerShell Profile (Automatic on Startup)

This adds Node.js to PATH automatically every time you open PowerShell.

### Steps:

1. **Check if profile exists:**
   ```powershell
   Test-Path $PROFILE
   ```

2. **Create profile if it doesn't exist:**
   ```powershell
   if (!(Test-Path $PROFILE)) {
     New-Item -ItemType File -Path $PROFILE -Force
   }
   ```

3. **Add Node.js to PATH in profile:**
   ```powershell
   Add-Content -Path $PROFILE -Value '$env:PATH += ";C:\Program Files\nodejs"'
   ```

4. **Reload profile:**
   ```powershell
   . $PROFILE
   ```

5. **Test:**
   ```powershell
   node --version
   ```

Now every time you open PowerShell, Node.js will be in PATH automatically!

## Option 3: Use the Setup Script (Easiest)

Run the setup script I created:

```powershell
# Right-click PowerShell > Run as Administrator
cd C:\Users\Aditya\OneDrive\Desktop\KumbhSahyogi-1jsx\KumbhSahyogi-1jsx
.\setup-path.ps1
```

Then restart PowerShell.

## Which Option to Choose?

- **Option 1** - Best for permanent system-wide fix
- **Option 2** - Best if you only want it in PowerShell
- **Option 3** - Quickest, uses the script I created

After any option, restart PowerShell and `node` and `npm` will work directly!

