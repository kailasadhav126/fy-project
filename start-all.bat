@echo off
echo ========================================
echo 🚀 Starting KumbhSahyogi - All Services
echo ========================================
echo.

echo 📊 Make sure MongoDB is running!
echo If not, start it in a separate terminal: mongod
echo.

echo 🔧 Starting Backend Server (Port 4000)...
start "Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo 🌐 Starting Client Website (Port 5173)...
start "Client" cmd /k "cd client && npm run dev"

echo 👨‍💼 Starting Admin Panel (Port 5174)...
start "Admin" cmd /k "cd admin && npm run dev"

echo.
echo ✅ All services started in separate windows!
echo ========================================
echo 📱 Client:  http://localhost:5173
echo 👨‍💼 Admin:   http://localhost:5174
echo 🔧 Server:  http://localhost:4000
echo ========================================
echo.
echo Close the terminal windows to stop services
pause
