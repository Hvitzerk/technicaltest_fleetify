import axios from 'axios';
import Cookies from 'js-cookie';

// Create Axios (default)
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

 // Interceptor before request send
api.interceptors.request.use(
  (config) => {
    // pengambilan token dari cookie 
    const token = Cookies.get('token');
    
    // Kalau tokennya ada, put in header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;