import { get } from '../axios.js'

const baseUrl = '/api/project'

export function listProject(){
    return get(baseUrl + '/list');
}