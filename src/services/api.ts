import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.aniapi.com/v1/",
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
});
