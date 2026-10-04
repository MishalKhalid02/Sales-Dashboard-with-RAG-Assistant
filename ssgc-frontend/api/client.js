import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL='https://ssgc-backend-lilac.vercel.app/api';



const apiClient = axios.create({baseURL: BASE_URL});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;