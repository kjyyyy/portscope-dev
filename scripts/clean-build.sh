#!/bin/bash
# Clean Next.js build cache
# Usage: ./scripts/clean-build.sh

echo "🧹 Cleaning Next.js build cache..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next directory"
else
  echo "ℹ️  .next directory doesn't exist"
fi

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Removed node_modules/.cache"
fi

echo "✨ Build cache cleaned! Run 'npm run dev' to start fresh."

