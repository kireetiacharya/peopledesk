import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function errorMessage(error) {
  return error.response?.data?.detail
    || error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || 'Something went wrong. Please try again.'
}

export default api
