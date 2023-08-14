import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

class HttpClient {
    private instance = axios.create();
    private config: AxiosRequestConfig;

    constructor(config: AxiosRequestConfig = {}) {
        this.config = config;
    }
    private handleError(error: AxiosError) {
        if (error.response) {
            console.error('Response error:', error.response.status);
        } else if (error.request) {
            console.error('Request error:', error.request);
        } else {

            console.error('Error:', error.message);
        }
    }
    public async get<T>(url: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance.get(url, this.config);
            return response.data;
        } catch (error: any | unknown) {
            this.handleError(error);
            throw error;
        }
    }


}
export default new HttpClient({ baseURL: 'https://swapi.dev/api' })