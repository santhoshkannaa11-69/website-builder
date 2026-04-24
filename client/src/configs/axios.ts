import axios from 'axios';
import { apiBaseUrl } from './api-base';

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true
})

export default api
