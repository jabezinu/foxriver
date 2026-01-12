@echo off
REM Build script for both client and admin (Windows)

echo 🚀 Building Foxriver Applications...
echo.

REM Build Client
echo 📦 Building Client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build failed!
    exit /b 1
)
echo ✅ Client build successful!
cd ..

echo.

REM Build Admin
echo 📦 Building Admin...
cd admin
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Admin build failed!
    exit /b 1
)
echo ✅ Admin build successful!
cd ..

echo.
echo 🎉 All builds completed successfully!
echo.
echo 📁 Build outputs:
echo    - Client: ./client/dist/
echo    - Admin: ./admin/dist/
echo.
echo 📝 Next steps:
echo    1. Upload the contents of client/dist/ to your client hosting
echo    2. Upload the contents of admin/dist/ to your admin hosting
echo    3. Ensure the appropriate config file (.htaccess, _redirects, etc.) is included
echo.
