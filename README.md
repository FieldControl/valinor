# Kanban Board - Angular & NestJS Monorepo

This project implements a Kanban board with drag-and-drop functionality, using Angular for the frontend and NestJS for the backend, organized in an NX monorepo.

## ✨ Features

- ✅ **Complete CRUD** for columns and cards
- ✅ **Drag & Drop** for columns and cards
- ✅ **Position persistence** after refresh
- ✅ **Responsive interface** with Tailwind CSS
- ✅ **Complete test coverage** (Unit + E2E)
- ✅ **Shared types** between frontend and backend
- ✅ **Local development** ready

## 🚀 Technologies Used

### Backend (NestJS)

- **NestJS** - Node.js framework
- **TypeORM** - TypeScript ORM
- **SQLite** - Database
- **class-validator** - Data validation
- **class-transformer** - Data transformation

### Frontend (Angular)

- **Angular 20** - Frontend framework
- **Angular CDK** - Components and utilities
- **Tailwind CSS** - CSS framework
- **RxJS** - Reactive programming

### DevOps

- **NX** - Monorepo and build tools
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **TypeScript** - Static typing
- **ESLint** - Linting and formatting

## 📁 Project Structure

```
apps/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── features/        # Feature modules
│   │   │   ├── columns/     # Columns module
│   │   │   │   ├── dto/     # Validation DTOs
│   │   │   │   ├── entities/ # TypeORM entities
│   │   │   │   ├── *.controller.ts
│   │   │   │   ├── *.service.ts
│   │   │   │   └── *.module.ts
│   │   │   └── cards/       # Cards module
│   │   │       ├── dto/
│   │   │       ├── entities/
│   │   │       ├── *.controller.ts
│   │   │       ├── *.service.ts
│   │   │       └── *.module.ts
│   │   ├── database/        # Database configuration
│   │   └── app/            # Main module
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Kanban components
│   │   │   │   ├── kanban-board/
│   │   │   │   ├── kanban-column/
│   │   │   │   ├── add-column-dialog/
│   │   │   │   ├── add-card-form/
│   │   │   │   └── delete-confirmation-modal/
│   │   │   ├── services/    # Angular services
│   │   │   └── models/      # TypeScript interfaces
│   │   └── styles.css
├── frontend-e2e/           # Frontend E2E tests
├── backend-e2e/            # Backend E2E tests
└── libs/
    └── shared/
        └── types/          # Shared types
```

## 🛠 Available Scripts

```bash
# Development
npm run dev                 # Run backend and frontend simultaneously
npm run dev:backend         # Backend only
npm run dev:frontend        # Frontend only

# Build
npm run build               # Build both
npm run build:backend       # Backend build
npm run build:frontend      # Frontend build

# Testing
npm run test                # Unit tests for both
npm run test:backend         # Backend unit tests
npm run test:frontend        # Frontend unit tests
npm run e2e:frontend         # Frontend E2E tests
npm run e2e:backend          # Backend E2E tests

# Linting
npm run lint                 # Lint both projects
```

## 🚀 How to Run

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run in development mode:**

   ```bash
   npm run dev
   ```

3. **Access the applications:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api

## 📊 API Endpoints

### Columns

- `GET /api/columns` - List all columns
- `POST /api/columns` - Create new column
- `GET /api/columns/:id` - Get column by ID
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `PATCH /api/columns/positions/update` - Update positions

### Cards

- `GET /api/cards` - List all cards
- `GET /api/cards?columnId=:id` - List cards from a column
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get card by ID
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PATCH /api/cards/:id/move` - Move card between columns
- `PATCH /api/cards/positions/update` - Update positions

## 🗄 Data Models

### Column

```typescript
{
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Card

```typescript
{
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  columnId: number;
  column: Column;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testing

### Backend

- **Unit tests:** Jest
- **Integration tests:** Jest + Supertest
- **Coverage:** Configured for 80%

### Frontend

- **Unit tests:** Jest + Angular Testing Utilities
- **E2E tests:** Cypress
- **Coverage:** Configured for 80%

### Test Results

- ✅ **Frontend Unit Tests:** 11/11 passing (KanbanService)
- ✅ **Backend Unit Tests:** 32/32 passing (Services + Controllers)
- ✅ **Frontend E2E Tests:** 6/6 passing (UI interactions)
- ✅ **Backend E2E Tests:** 1/1 passing (API endpoints)

## 🔧 Configuration

### Database

The project uses SQLite by default, configured in `apps/backend/src/database/database.config.ts`. The database file (`kanban.db`) is created automatically when you first run the application.
