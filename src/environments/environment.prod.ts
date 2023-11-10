import 'dotenv/config';

const API_KEY = process.env['API_KEY'];

export const environment = {
  production: true,
  GITHUB_API_URL: 'https://api.github.com',
  GITHUB_API_KEY: API_KEY,
};
