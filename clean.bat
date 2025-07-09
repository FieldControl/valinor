@echo off
REM Clean script to remove files that should not be in version control
REM Run this before committing if you accidentally added any of these files

echo Cleaning up files that should not be in version control...

REM Remove OS-specific files
del /s /q .DS_Store 2>nul
del /s /q Thumbs.db 2>nul
del /s /q desktop.ini 2>nul

REM Remove editor-specific directories
rmdir /s /q .cursor 2>nul
rmdir /s /q .idea 2>nul
rmdir /s /q .vscode 2>nul

REM Remove build outputs
rmdir /s /q packages\frontend\dist 2>nul
rmdir /s /q packages\backend\dist 2>nul
rmdir /s /q packages\frontend\.angular 2>nul

REM Remove logs
del /s /q *.log 2>nul

REM Remove environment files (except examples)
del /s /q .env 2>nul
del /s /q *.env 2>nul

REM Remove auto-generated GraphQL schema
del /q packages\backend\src\schema.gql 2>nul

REM Remove root package-lock.json (we use workspace-specific ones)
del /q package-lock.json 2>nul

echo.
echo Cleanup complete!
echo.
echo Remember to:
echo   1. Keep your .env files local (never commit them)
echo   2. Use 'npm install' to regenerate node_modules
echo   3. Run 'npm run build' to regenerate build outputs
echo   4. The GraphQL schema will auto-generate when you start the backend 