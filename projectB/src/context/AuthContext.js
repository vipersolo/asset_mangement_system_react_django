import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On refresh, check if a token exists and decode it
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token");
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
    try {
        const response = await api.post('token/', { username, password });
        console.log("1. Django Response:", response.data); // Should show access/refresh

        const { access } = response.data;
        localStorage.setItem('token', access);

        // This is where it usually fails if jwt-decode isn't working
        const decoded = jwtDecode(access);
        console.log("2. Decoded User:", decoded); 

        setUser(decoded);
        return decoded; 
    } catch (error) {
        console.error("Login logic failed:", error);
        throw error;
    }
};

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* We don't render the app until the initial token check is done */}
            {!loading && children}
        </AuthContext.Provider>
    );
};