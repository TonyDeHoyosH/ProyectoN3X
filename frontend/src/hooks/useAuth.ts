import { useState, useCallback } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        document.cookie.includes('access_token') // Check cookie existence (will be parsed via backend anyway) 
    );

    const checkAuthStatus = useCallback(() => {
        setIsAuthenticated(document.cookie.includes('access_token'));
    }, []);

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
    };

    return { isAuthenticated, setIsAuthenticated, checkAuthStatus, logout };
};
