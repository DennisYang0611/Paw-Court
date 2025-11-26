#!/bin/bash
set -euo pipefail

# entrypoint.sh only starts the prebuilt app, per DevBox guidelines.
# Make sure `npm run build` (or `pnpm run build`) has already been executed
# during the image build / development phase so that the .next output exists.

export NODE_ENV=${NODE_ENV:-production}
export HOSTNAME=${HOSTNAME:-0.0.0.0}
export PORT=${PORT:-3000}

# Check if the build exists, if not, build the app
if [ ! -f ".next/BUILD_ID" ]; then
    echo "No production build found. Building the app first..."
    npm run build
fi

echo "Starting Next.js production server on ${HOSTNAME}:${PORT}..."

# For Next.js 14 the default `next start` serves the prebuilt .next directory.
# If you prefer the standalone output, switch this to:
#   node .next/standalone/server.js
npm run start
