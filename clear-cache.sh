#!/bin/bash

# Clear Next.js and Node cache script
# Run this if you encounter ChunkLoadError or other cache issues

echo "🧹 Clearing Next.js and Node.js caches..."

# Stop any running dev server
echo "Stopping development server..."
pkill -f "next dev" 2>/dev/null || true

# Clear Next.js build cache
echo "Clearing .next directory..."
rm -rf .next

# Clear node modules cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Clear npm/pnpm cache
echo "Clearing package manager cache..."
npm cache clean --force 2>/dev/null || true
pnpm store prune 2>/dev/null || true

echo "✅ Cache cleared successfully!"
echo "💡 You can now run 'npm run dev' to restart the server"