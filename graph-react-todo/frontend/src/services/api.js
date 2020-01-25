import axios from "axios";

export default () => {
  const instance = axios.create({
    baseURL: "http://localhost:3000/",
    withCredentials: false,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  return instance;
};
