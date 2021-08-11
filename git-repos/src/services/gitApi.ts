import axios from 'axios';

export const gitApi = axios.create({
  baseURL: 'https://api.github.com',
});
