# Detailed Setup Guide for Valinor Kanban Board

This guide provides step-by-step instructions to set up the Valinor Kanban board application from a fresh clone.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

## Prerequisites

### Required Software
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** for cloning the repository
- **Supabase Account** (free tier works)

### Recommended Tools
- **VS Code** or **Cursor** IDE
- **Angular DevTools** browser extension
- **GraphQL Playground** or similar GraphQL client

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd valinor
```

### 2. Install Dependencies

The project uses a monorepo structure with separate frontend and backend packages.

```bash
# Install root dependencies (if any)
npm install

# Install frontend dependencies
cd packages/frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root directory
cd ../..
```

## Database Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be provisioned (takes ~2 minutes)

### 2. Get Your Supabase Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (safe to use in frontend)
   - **Service Role Key** (keep this secret!)

### 3. Apply Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql` from the project root
4. Paste and run the query
5. You should see success messages for all created tables, indexes, and policies

## Environment Configuration

### Backend Environment Setup

1. Navigate to the backend directory:
   ```bash
   cd packages/backend
   ```

2. Create a `.env` file:
   ```bash
   touch .env
   ```

3. Add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Frontend Environment Setup

The frontend uses Angular environments. The default configuration should work, but you can modify if needed:

1. Check `packages/frontend/src/environments/environment.ts`
2. Ensure the API URL points to your backend (default: `http://localhost:3000/graphql`)

## Running the Application

### Development Mode

You'll need two terminal windows/tabs:

#### Terminal 1: Backend
```bash
cd packages/backend
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000
📊 GraphQL Playground: http://localhost:3000/graphql
```

#### Terminal 2: Frontend
```bash
cd packages/frontend
npm start
```

You should see:
```
** Angular Live Development Server is listening on localhost:4200 **
```

### Verify Everything is Working

1. **Backend Health Check**: 
   - Open http://localhost:3000/graphql
   - You should see the GraphQL Playground

2. **Frontend Check**:
   - Open http://localhost:4200
   - You should see the Kanban board application

3. **Database Connection**:
   - Try creating a new board
   - If successful, your database is properly connected

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port already in use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 4200 (frontend)
npx kill-port 4200
```

#### 3. Database connection errors
- Verify your `.env` file exists and has correct values
- Check if your Supabase project is active (not paused)
- Ensure you're using the Service Role Key for backend

#### 4. GraphQL schema not found
The `schema.gql` file is auto-generated. If missing:
```bash
cd packages/backend
npm run start:dev
# The file will be generated automatically
```

#### 5. CORS errors
- Ensure backend is running on port 3000
- Check that frontend environment points to correct backend URL

## Development Workflow

### Making Changes

1. **Frontend Changes**: 
   - Hot reload is enabled
   - Changes appear immediately in browser

2. **Backend Changes**:
   - NestJS watches for changes
   - Server restarts automatically

### Running Tests

```bash
# Frontend tests
cd packages/frontend
npm test

# Backend tests
cd packages/backend
npm test
```

### Building for Production

```bash
# Build frontend
cd packages/frontend
npm run build
# Output: packages/frontend/dist/

# Build backend
cd packages/backend
npm run build
# Output: packages/backend/dist/
```

### Code Quality

Before committing:
```bash
# Format code (if prettier is configured)
npm run format

# Lint code (if eslint is configured)
npm run lint
```

## Project Structure Overview

```
valinor/
├── packages/
│   ├── frontend/              # Angular application
│   │   ├── src/
│   │   │   ├── app/           # Components, services, modules
│   │   │   ├── assets/        # Images, fonts, etc.
│   │   │   └── environments/  # Environment configs
│   │   ├── angular.json       # Angular CLI config
│   │   └── package.json       # Frontend dependencies
│   │
│   └── backend/               # NestJS application
│       ├── src/
│       │   ├── kanban/        # Main business logic
│       │   ├── realtime/      # WebSocket functionality
│       │   └── supabase/      # Database service
│       ├── .env               # Environment variables (create this)
│       ├── nest-cli.json      # NestJS CLI config
│       └── package.json       # Backend dependencies
│
├── supabase-schema.sql        # Database schema
├── .gitignore                 # Git ignore rules
├── README.md                  # Project overview
└── SETUP.md                   # This file
```

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [GraphQL Documentation](https://graphql.org/learn)

## Need Help?

If you encounter issues not covered here:
1. Check the console logs (browser and terminal)
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Try the troubleshooting steps above
5. Create an issue in the repository with:
   - Error messages
   - Steps to reproduce
   - Your environment details (OS, Node version, etc.) 