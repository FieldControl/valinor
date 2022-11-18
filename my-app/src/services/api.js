import axios from 'axios'
import md5 from "md5";

//CRIANDO A REQUISICAO GET DA API DA MARVEL //
const apikey = '9ccb7e71efe3238198fbe2c66a5e744d';
const privateKey = '3eaecc9d64d2002589472a2db108e6786054aad7';

const ts = Number(new Date());

const hash = md5(ts + privateKey + apikey);

const api = axios.create(
    {
        baseURL: 'https://gateway.marvel.com:443/v1/public/',
        params: {
            ts,
            apikey,
            hash,
        },
    });

export default api;

