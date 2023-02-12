# Url-Analyzer

A tool to analyze any URL and get in-depth information about it. With the app, you can access information such as general info, requests data exchanged between the client and server, and an in-depth analysis of the site provided by the Google Lighthouse tool. The results can be stored for later access.

## Features

- General info
- Requests data exchanged between the client and server
- In-depth analysis of the site provided by the Google Lighthouse tool
- Store the results for later access
- More to come...

## Requirements

- Node.js version 18x or higher
- Chromium installed on your system

## Usage

### Clone the repository

```bash
git clone https://github.com/Url-Analyzer/UrlAnalyzer.git
```

### Use the installation script

```bash
./start.sh
```

### Populate the .env file with the variables present in the .env.example file

## Run the app

### Useful commands

```bash
# Build the api
yarn api:build

# Run the api
yarn api:dev

# Build the client
yarn client:build

# Run the client
yarn client:dev

# Build the api and the client
yarn build

# Run the api and the client
yarn dev

```

Visit <http://localhost:3000> in your browser to access the app.

## Examples

### Analyzing the URL <https://www.example.com>

- Main Page
![image](https://user-images.githubusercontent.com/67063134/218296194-c697546d-5e9c-4d21-a7ef-5430ef4910cc.png)

- Score and Analysis
![image](https://user-images.githubusercontent.com/67063134/218296189-b1cfc5d9-0217-40fa-a185-70d175e21031.png)


- Store the results for later access

## Troubleshooting

If you encounter an error, try running ./start.sh with elevated permissions (e.g., as root or administrator).

If you are still encountering problems, please open an issue on the repository with a detailed description of the problem and the steps you took to reproduce it.

## Future plans

- Improve performance
- Add more in depth analysis
- Give login some utility
- Reduce the size of the analysis results
- Add tests to the project (beyond github actions)

## Contributing

We welcome contributions to the Url-Analyzer project. If you'd like to contribute, please follow these steps:

- Fork the repository
- Create a branch for your changes (e.g., feature/my-awesome-feature)
- Commit your changes
- Open a pull request

## License

Url-Analyzer is distributed under the GNU AGPLv3 license. Please see the LICENSE file for more information.
