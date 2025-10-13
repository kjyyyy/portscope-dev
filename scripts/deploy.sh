#!/bin/bash

# PortScope Dev Deployment Script
echo "🚀 Deploying PortScope Dev..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Ready for deployment!"
    echo ""
    echo "To deploy to Vercel:"
    echo "1. Run: npx vercel"
    echo "2. Follow the prompts"
    echo "3. Your app will be deployed automatically"
    echo ""
    echo "To deploy manually:"
    echo "1. Upload the .next folder to your hosting provider"
    echo "2. Run: npm start"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
