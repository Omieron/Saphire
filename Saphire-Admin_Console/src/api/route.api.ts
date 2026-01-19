import api from './axios';
import type { ApiResponse } from './auth.api';

export interface ProductRouteStep {
    id: number;
    stepName: string;
    stepOrder: number;
    stepType: string;
    estimatedSetupMinutes: number;
    estimatedCycleMinutes: number;
}

export interface ProductRoute {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    name: string;
    version: number;
    active: boolean;
    steps: ProductRouteStep[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductRouteStepRequest {
    stepName: string;
    stepOrder: number;
    stepType: string;
    estimatedSetupMinutes?: number;
    estimatedCycleMinutes?: number;
}

export interface ProductRouteRequest {
    productId: number;
    name: string;
    version?: number;
    active?: boolean;
    steps?: ProductRouteStepRequest[];
}

export const routeApi = {
    getAll: () =>
        api.get<ApiResponse<ProductRoute[]>>('/routes'),

    getById: (id: number) =>
        api.get<ApiResponse<ProductRoute>>(`/routes/${id}`),

    getByProductId: (productId: number) =>
        api.get<ApiResponse<ProductRoute[]>>(`/routes/product/${productId}`),

    getActiveByProductId: (productId: number) =>
        api.get<ApiResponse<ProductRoute>>(`/routes/product/${productId}/active`),

    create: (data: ProductRouteRequest) =>
        api.post<ApiResponse<ProductRoute>>('/routes', data),

    update: (id: number, data: ProductRouteRequest) =>
        api.put<ApiResponse<ProductRoute>>(`/routes/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/routes/${id}`),
};
