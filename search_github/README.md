# SearchGithub

**SearchGithub** is a web application that allows users to search for repositories on the GitHub API. The project is organized into distinct sections, each with a specific role: service, model, and components.

## Features

- **Header Section:**

  - A navigation bar with an input field where users can enter search text.
  - A search button to trigger the search.
  - A dropdown menu for sorting repositories by various criteria, including best match, most stars, least stars, most forks, least forks, most recent, and oldest.
  - Another dropdown to adjust the number of pages to display.
  - All these features are disabled when the input field is empty.

- **Article Section:**

  - Responsible for displaying the search results, i.e., the repositories.

- **Navbar Section:**
  - Buttons for navigating to the next page and the previous page.
  - A dropdown menu for quick navigation to any specific page.
  - The navbar is only visible when repositories are displayed.

## Technologies Used

- **Styling**: The page's styling is implemented using [Tailwind CSS](https://tailwindcss.com/).

- **Unit Testing**: The project includes unit tests implemented using [Jasmine](https://jasmine.github.io/) for ensuring code quality.

## Getting Started

To run the application locally, follow these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/SearchGithub.git
   ```
2. Enter the repository:
   ```bash
   cd SearchGithub
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the project:
   ```bash
   npm start
   ```
   The application will be accessible at http://localhost:3000.

## Running Unit Tests

To run unit tests for the project, you can use the following command:

```bash
npm run test:unit
```
