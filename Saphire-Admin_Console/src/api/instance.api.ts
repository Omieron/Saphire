import api from './axios';
import type { ApiResponse } from './auth.api';

export interface ProductionStep {
    id: number;
    routeStepId: number;
    routeStepName: string;
    machineId: number;
    machineName: string;
    operatorId: number | null;
    operatorName: string | null;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
    failureReason: string | null;
    correctiveAction: string | null;
    notes: string | null;
}

export interface ProductInstance {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    routeId: number;
    routeName: string;
    locationId: number;
    locationName: string;
    serialNumber: string;
    status: string;
    priority: number;
    dueDate: string | null;
    startedAt: string | null;
    completedAt: string | null;
    notes: string | null;
    createdById: number | null;
    createdByName: string | null;
    productionSteps: ProductionStep[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductInstanceRequest {
    productId: number;
    routeId: number;
    locationId: number;
    serialNumber?: string;
    priority?: number;
    dueDate?: string;
    notes?: string;
}

export const instanceApi = {
    getAll: () =>
        api.get<ApiResponse<ProductInstance[]>>('/product-instances'),

    getById: (id: number) =>
        api.get<ApiResponse<ProductInstance>>(`/product-instances/${id}`),

    getByLocationId: (locationId: number) =>
        api.get<ApiResponse<ProductInstance[]>>(`/product-instances/location/${locationId}`),

    getPendingByLocationId: (locationId: number) =>
        api.get<ApiResponse<ProductInstance[]>>(`/product-instances/location/${locationId}/pending`),

    getByStatus: (status: string) =>
        api.get<ApiResponse<ProductInstance[]>>(`/product-instances/status/${status}`),

    create: (data: ProductInstanceRequest) =>
        api.post<ApiResponse<ProductInstance>>('/product-instances', data),

    update: (id: number, data: ProductInstanceRequest) =>
        api.put<ApiResponse<ProductInstance>>(`/product-instances/${id}`, data),

    updateStatus: (id: number, status: string) =>
        api.patch<ApiResponse<ProductInstance>>(`/product-instances/${id}/status?status=${status}`),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/product-instances/${id}`),
};
