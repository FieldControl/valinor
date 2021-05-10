import axios from "axios";

const baseURL = "https://swapi.dev/api";
export const getApi = axios.create({ baseURL: baseURL });
