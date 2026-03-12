import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000"
});

// Attach token or admin key automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    if (isAdmin) {
        req.headers["x-admin-key"] = "admin-panel-key";
    }

    return req;
});

export default API;