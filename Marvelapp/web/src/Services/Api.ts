import React, {useEffect, useState} from 'react';
import axios from 'axios';
import md5 from 'md5';

const publicKey ='SuaMarvelPublicKey';
const privateKey ='SuaMarvelPrivateKey';

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
