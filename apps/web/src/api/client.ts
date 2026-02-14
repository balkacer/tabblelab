import axios from 'axios'

const baseURL =
    import.meta.env.VITE_API_BASE_URL?.toString() ?? 'http://localhost:4000'

export const api = axios.create({ baseURL, withCredentials: true })