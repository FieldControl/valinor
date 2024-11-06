# Kanban API - Valinor Challenge

A simple Kanban API built with NestJS to manage columns and cards. The application allows users to create, update, delete, and view columns and cards within those columns.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)

### Installation

1. **Clone the repository:**

   ```git clone https://github.com/NaathanFerreira/valinor-challenge```

2. **Start PostgreSQL with Docker:**

   Navigate to the project directory and bring up the PostgreSQL container:

   ```bash
   cd ./challenge
   docker-compose up -d
   ```

   This will start the PostgreSQL database in a Docker container.

3. **Install Dependencies and Setup Prisma:**

   Navigate to the server directory, install dependencies, generate Prisma client, run     migrations, and seed the database:

   ```bash
   cd ./server
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Run the API:**

   ```bash
   npm run start:dev
   ```

   This will start the API on 'http://localhost:3000'.

### Running End-to-End Tests

To execute the end-to-end tests, run:

```bash
npm run test:e2e
```

## API Endpoints

### Columns

- **Create Column**

  - **Endpoint:** POST '/columns'
  - **Body:** '{ "name": "Column Name" }'
  - **Response:** '201 Created'

- **Get All Columns**

  - **Endpoint:** GET '/columns'
  - **Response:** '200 OK'

- **Delete Column**

  - **Endpoint:** DELETE '/columns/:id'
  - **Response:** '200 OK'

- **Update Column**

  - **Endpoint:** PATCH '/columns/:id'
  - **Body:** '{ "name": "Updated Column Name" }'
  - **Response:** '200 OK'

### Cards

- **Create Card**

  - **Endpoint:** POST '/cards'
  - **Body:** '{ "columnId": 1, "title": "Card Title", "description": "Card Description" }'
  - **Response:** '201 Created'

- **Get Cards by Column**

  - **Endpoint:** GET '/cards/:columnId'
  - **Response:** '200 OK'

- **Delete Card**

  - **Endpoint:** DELETE '/cards/:id'
  - **Response:** '200 OK'

- **Update Card**

  - **Endpoint:** PATCH '/cards/:id'
  - **Body:** '{ "title": "Updated Title", "description": "Updated Description" }'
  - **Response:** '200 OK'
