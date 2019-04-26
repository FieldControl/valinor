import qs from 'qs'
import CryptoJS from 'crypto-js'

//TODO mover para .env
const PRIV_KEY = 'e958f7adfc9b6671762c698c487f28e1d06900fa'
const PUBLIC_KEY = '6266ee79e6c281ce71b929653b15c877'
const URL_BASE = '//gateway.marvel.com/v1/public'

const ts = new Date().getTime()
const defaultParams = {
    ts,
    apikey: PUBLIC_KEY,
    hash: CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString()
}

export const get = (url, params = {}) => {
    params = {
        ...defaultParams,
        ...params
    }
    params = qs.stringify(params)

    url = `${URL_BASE}${url}?${params}`

    return fetch(url).then(res => res.json())
}