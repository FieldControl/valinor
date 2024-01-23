import axios from "axios";

const api = axios.create({
    baseURL: 'https://swapi.dev/api/',

  });

  axios.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  export default api;