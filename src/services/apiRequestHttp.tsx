import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const config: AxiosRequestConfig = {
    baseURL: "https://api.github.com/search"
};

export const client: AxiosInstance = axios.create(config);