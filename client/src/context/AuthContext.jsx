import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const adminStatus = localStorage.getItem("isAdmin") === "true";
        let storedUser = null;
        try {
            const rawUser = localStorage.getItem("user");
            if (rawUser && rawUser !== "undefined") storedUser = JSON.parse(rawUser);
        } catch {
            localStorage.removeItem("user");
        }
        if (adminStatus) setIsAdmin(true);
        if (storedUser) setUser(storedUser);
    }, []);

    const adminLogin = (username, password) => {
        if (username === "admin" && password === "admin123") {
            localStorage.setItem("isAdmin", "true");
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const userLogin = (userData, token) => {
        if (!userData) return;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setIsAdmin(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAdmin, user, adminLogin, userLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}