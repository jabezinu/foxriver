#!/bin/bash

# Build script for both client and admin

echo "🚀 Building Foxriver Applications..."
echo ""

# Build Client
echo "📦 Building Client..."
cd client
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Client build successful!"
else
    echo "❌ Client build failed!"
    exit 1
fi
cd ..

echo ""

# Build Admin
echo "📦 Building Admin..."
cd admin
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Admin build successful!"
else
    echo "❌ Admin build failed!"
    exit 1
fi
cd ..

echo ""
echo "🎉 All builds completed successfully!"
echo ""
echo "📁 Build outputs:"
echo "   - Client: ./client/dist/"
echo "   - Admin: ./admin/dist/"
echo ""
echo "📝 Next steps:"
echo "   1. Upload the contents of client/dist/ to your client hosting"
echo "   2. Upload the contents of admin/dist/ to your admin hosting"
echo "   3. Ensure the appropriate config file (.htaccess, _redirects, etc.) is included"
echo ""
