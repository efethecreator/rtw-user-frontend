import axios from "axios";
console.log(import.meta.env.VITE_BACKEND_API_URL);

axios.defaults.withCredentials = true;

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API_URL;
