import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../api/auth.api';
import { authApi } from '../api/auth.api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionExpired: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const handleSessionExpired = () => {
            setSessionExpired(true);
        };

        window.addEventListener('auth-session-expired', handleSessionExpired);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);

        return () => {
            window.removeEventListener('auth-session-expired', handleSessionExpired);
        };
    }, []);

    const login = async (username: string, password: string) => {
        const response = await authApi.login({ username, password });
        const { token: newToken, user: newUser } = response.data.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
        setSessionExpired(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const clearSessionExpired = () => {
        setSessionExpired(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                sessionExpired,
                login,
                logout,
                clearSessionExpired,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
