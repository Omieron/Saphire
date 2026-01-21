import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface AppAlert {
    id: string;
    message: string;
    type: AlertType;
    targetUrl?: string; // Where to go when clicked
    createdAt: number;
}

interface NotificationContextType {
    alerts: AppAlert[];
    addAlert: (alert: Omit<AppAlert, 'id' | 'createdAt'> & { id?: string }) => void;
    removeAlert: (id: string) => void;
    clearAlerts: () => void;
    hasNewAlerts: boolean;
    markAsSeen: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<AppAlert[]>([]);
    const [hasNewAlerts, setHasNewAlerts] = useState(false);

    const addAlert = (alert: Omit<AppAlert, 'id' | 'createdAt'> & { id?: string }) => {
        const id = alert.id || Math.random().toString(36).substr(2, 9);

        // Prevent duplicate IDs (useful for "Pending QC" pulse)
        setAlerts(prev => {
            if (prev.some(a => a.id === id)) return prev;
            setHasNewAlerts(true);
            return [...prev, { ...alert, id, createdAt: Date.now() }];
        });
    };

    const removeAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const clearAlerts = () => {
        setAlerts([]);
        setHasNewAlerts(false);
    };

    const markAsSeen = () => {
        setHasNewAlerts(false);
    };

    return (
        <NotificationContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts, hasNewAlerts, markAsSeen }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
