#!/bin/bash

# Create dist directory
mkdir -p dist

# Copy frontend files
cp index.html dist/
cp _redirects dist/
cp -r js dist/
cp -r styles dist/

# Copy backend files (needed for serverless functions)
cp -r models dist/
cp -r routes dist/
cp package.json dist/

echo "Build completed successfully!"
echo "Files copied to dist/ directory for Netlify deployment"
