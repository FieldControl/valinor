import axios from "axios";

export const constants = {
  CLIENT_ID: process.env.REACT_APP_API_CLIENT_ID,
  CLIENT_SECRET: process.env.REACT_APP_API_CLIENT_SECRET,
};

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export default instance;
