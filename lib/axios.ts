//para realizar socilitação http no lado cliente utilizo o axios
import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.API_GITHUB
})

// pesquisa o usuário
export const apiUser = axios.create({
    baseURL: process.env.API_USER_GITHUB
})