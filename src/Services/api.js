import axios from "axios";
import md5 from "md5";


const publicKey = '68ee2f1c5c79cc9843d37f316abbed71';
const privateKey = '8386a603fa16e89b8a885c80cdeb61068ebbc7f8';

const time = Number(new Date());

const hash = md5(time + privateKey + publicKey)

const api = axios.create({
    baseURL: 'http://gateway.marvel.com/v1/public/',
    params:{
        ts: time,
        apikey: publicKey,
        hash,

    }
});

export default api;

