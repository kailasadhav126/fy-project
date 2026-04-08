@echo off
echo ========================================
echo Installing Authentication Dependencies
echo ========================================
echo.

echo Installing server dependencies...
cd server
call npm install bcryptjs jsonwebtoken
if %errorlevel% neq 0 (
    echo Error installing server dependencies!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update server/.env with JWT_SECRET
echo 3. Run: cd server ^&^& npm start
echo 4. Run: cd client ^&^& npm run dev
echo 5. Run: cd admin ^&^& npm run dev
echo.
pause
