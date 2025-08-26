#!/bin/bash

# Stop any running Next.js server
echo "Stopping any running Next.js servers..."
pkill -f "node.*next"

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Start Next.js server with environment variables loaded
echo "Starting Next.js server..."
npm run dev
