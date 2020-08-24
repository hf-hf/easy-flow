import { request } from '../axios.js'

const baseUrl = '/api/mixed'

export function saveMixed(data){
    return request('post', baseUrl, data);
}

export function getData(id){
    return request('get', baseUrl + "/data/" + id);
}