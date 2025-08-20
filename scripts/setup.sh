#!/bin/bash

echo "🚀 Setting up MRI Guys React Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories if they don't exist
mkdir -p public
mkdir -p src/components

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the development server:"
echo "   npm start"
echo ""
echo "🔨 To build for production:"
echo "   npm run build"
echo ""
echo "📚 For more information, see README.md"
