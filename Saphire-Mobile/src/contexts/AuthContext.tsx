import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        const savedToken = localStorage.getItem('token');
        // Set axios header immediately on load
        if (savedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        return savedToken;
    });

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch user info
            axios.get('/api/v1/auth/me').then(res => {
                const userData = res.data.data;
                setUser(userData);
                // Set X-User-Id header for backend API calls
                axios.defaults.headers.common['X-User-Id'] = userData.id.toString();
            }).catch(() => {
                logout();
            });
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        const response = await axios.post('/api/v1/auth/login', { username, password });
        const { token: newToken, user: userData } = response.data.data;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        axios.defaults.headers.common['X-User-Id'] = userData.id.toString();
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['X-User-Id'];
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
