import React, {useEffect, useState} from 'react';
import axios from 'axios';
import md5 from 'md5';

const publicKey ='567e6d89a80ed248a9844d9004fcd23e';
const privateKey ='362c5e3914a1389d105badf2754297136d2b8381';

const time = Number(new Date());

const hash = md5(time +  privateKey + publicKey);

const api = axios.create({
    baseURL: 'http://gateway.marvel.com/v1/public/',
    params:{
        ts: time,
        apikey: publicKey,
        hash,
    },
});

var info = document.querySelector('.informação')

export default api
