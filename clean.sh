#!/bin/bash

# Clean script to remove files that should not be in version control
# Run this before committing if you accidentally added any of these files

echo "🧹 Cleaning up files that should not be in version control..."

# Remove OS-specific files
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null
find . -name "desktop.ini" -type f -delete 2>/dev/null

# Remove editor-specific directories
rm -rf .cursor/ 2>/dev/null
rm -rf .idea/ 2>/dev/null
rm -rf .vscode/ 2>/dev/null

# Remove build outputs
rm -rf packages/frontend/dist/ 2>/dev/null
rm -rf packages/backend/dist/ 2>/dev/null
rm -rf packages/frontend/.angular/ 2>/dev/null

# Remove logs
find . -name "*.log" -type f -delete 2>/dev/null

# Remove environment files (except examples)
find . -name ".env" -type f ! -name "*.example" ! -name "env.example" -delete 2>/dev/null
find . -name "*.env" -type f ! -name "*.example" ! -name "env.example" -delete 2>/dev/null

# Remove auto-generated GraphQL schema
rm -f packages/backend/src/schema.gql 2>/dev/null

# Remove root package-lock.json (we use workspace-specific ones)
rm -f ./package-lock.json 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📝 Remember to:"
echo "  1. Keep your .env files local (never commit them)"
echo "  2. Use 'npm install' to regenerate node_modules"
echo "  3. Run 'npm run build' to regenerate build outputs"
echo "  4. The GraphQL schema will auto-generate when you start the backend" 