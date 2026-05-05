import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-2-bm35.onrender.com"
});

export default API;
