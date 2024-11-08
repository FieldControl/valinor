# Kanban Web Application - Valinor Challenge

This is the frontend for a Kanban application built with Angular. The application allows users to create and manage Kanban columns and cards, where each column can have multiple cards.

## Getting Started

### Prerequisites

Before running the app, ensure that you have the [backend server](https://github.com/NaathanFerreira/valinor-challenge/tree/master/challenge/server) running. Instructions for setting up and running the server are provided in the server folder's README file in the same repository.

### Installation

1. **Clone the repository:**

   ```git clone https://github.com/NaathanFerreira/valinor-challenge```

2. **Navigate to the web app directory and install dependencies:**

   ```bash
   cd ./challenge/web-app
   npm install
   ```

3. **Run the Angular development server:**

   ```bash
   npm run start
   ```

  The app will be available at http://localhost:4200. Ensure that the backend server is running to connect with the Kanban API.

### Running Unit Tests

To execute the unit tests, run:

```bash
npm run test
```

### Running End-to-End Tests

To execute the end-to-end tests, run:

```bash
npm run test:e2e:ui
```
