import axios from 'axios';
import md5 from 'md5';

export default axios.create({
  baseURL: 'http://gateway.marvel.com/v1/public/',
});

const ts = Math.floor(Date.now() / 1000);
const privateKey = '754e5b65a6486538c492f95c79a86c59dedc81a6';
const publicKey = '591238158bcf0e3edee9f08654fd898e';

const createHash = md5(ts + privateKey + publicKey);

export const keysApi = {
  createHash,
  ts,
  publicKey,
};
