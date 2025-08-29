# Nest Kanban App

This is a simple Kanban application built with NestJS. The application provides a basic structure for managing tasks in a Kanban board format.

## Project Structure

- `src/`
  - `app.controller.ts`: Handles incoming requests and defines routes.
  - `app.module.ts`: The root module of the application, imports necessary modules and controllers.
  - `app.service.ts`: Contains business logic and data handling methods.
  - `main.ts`: The entry point of the application, starts the server.
  
- `package.json`: Lists dependencies and scripts for the project.
- `nest-cli.json`: Configuration file for the Nest CLI.
- `tsconfig.json`: TypeScript configuration file.

## Installation

To install the dependencies, run:

```
npm install
```

## Running the Application

To start the application, use the following command:

```
npm run start
```

The application will be running on `http://localhost:3000`.

## API Endpoints

- `GET /`: Returns a greeting message.

## License

This project is licensed under the MIT License.