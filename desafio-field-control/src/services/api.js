import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com/search/',
});

export default api;
