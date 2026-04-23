import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL || 'https://web-wizard-liard.vercel.app',
    withCredentials: true
})

export default api