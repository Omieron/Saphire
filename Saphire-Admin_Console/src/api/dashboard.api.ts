import api from './axios';
import type { ApiResponse } from './auth.api';

export interface DashboardData {
    summary: {
        totalCompanies: number;
        totalLocations: number;
        totalMachines: number;
        totalProducts: number;
        totalUsers: number;
        totalQcTemplates: number;
        activeTasks: number;
    };
    qcMetrics: {
        totalRecords: number;
        passedCount: number;
        failedCount: number;
        passRate: number;
        weeklyTrend: Array<{
            date: string;
            passed: number;
            failed: number;
        }>;
    };
    machineMetrics: {
        statusDistribution: Array<{
            status: string;
            count: number;
            color: string;
        }>;
    };
    productPerformance: Array<{
        productName: string;
        totalQc: number;
        passRate: number;
    }>;
    alerts: Array<{
        id: string;
        type: 'ERROR' | 'WARNING' | 'INFO';
        title: string;
        message: string;
        timestamp: string;
    }>;
    activities: Array<{
        id: string;
        type: string;
        description: string;
        userName: string;
        timestamp: string;
        status: string;
    }>;
}

export const dashboardApi = {
    getData: () => api.get<ApiResponse<DashboardData>>('/dashboard/data'),
};
