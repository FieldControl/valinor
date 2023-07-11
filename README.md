# GitHub Repositories

This web application allows users to search for GitHub repositories and view information about them,
including the repository name, creator, main language, topics, number of stars, and forks.

## Stacks
- VueJS: Web user interface framework.
- Vuetify: Vue component framework.
- Axios: Promised-based HTTP client.
- Vitest: Unit test framework.
- VueRouter: Router for VueJS.
- Pinia: Store for VueJS.

## How to run
To run the application, follow these steps:

1. Install dependencies by running the following command:

```shell
npm i
```

2. Start the development server using Vite by running the following command:

```shell
vite
```

3. To run all the tests:

```shell
vitest
```

## Observations

I chose to use Vue.js for this project because it's the framework I'm most familiar with. However, I'm open and excited to learn other frameworks if needed.

Although the application is currently simple, I've designed it with extensibility in mind. That is why Pinia store is included.

For testing, I used Vitest, the recommended testing framework for Vue.js. However, if desired, it can easily be replaced with Jest or another testing library.

The application's top bar is designed to accommodate additional pages in the future, allowing for easy scalability.

There are not many components in the app, because I thought that there was no need to, it
is a very compact and easy to read code.

Vuetify was chosen for its flexible and beautiful components. It is highly regarded and widely used within the Vue.js community.