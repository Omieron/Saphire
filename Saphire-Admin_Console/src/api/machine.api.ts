import api from './axios';
import type { ApiResponse } from './auth.api';

export interface MachineStatus {
    id: number;
    machineId: number;
    currentStatus: string;
    currentInstanceId: number | null;
    currentStepId: number | null;
    currentOperatorId: number | null;
    currentOperatorName: string | null;
    statusSince: string;
    estimatedFinishAt: string | null;
}

export interface Machine {
    id: number;
    locationId: number;
    locationName: string;
    code: string;
    name: string;
    type: string;
    active: boolean;
    maintenanceMode: boolean;
    status: MachineStatus | null;
    createdAt: string;
    updatedAt: string;
}

export interface MachineRequest {
    locationId: number;
    code: string;
    name: string;
    type?: string;
    active?: boolean;
    maintenanceMode?: boolean;
}

export const machineApi = {
    getAll: () =>
        api.get<ApiResponse<Machine[]>>('/machines'),

    getById: (id: number) =>
        api.get<ApiResponse<Machine>>(`/machines/${id}`),

    getByLocationId: (locationId: number) =>
        api.get<ApiResponse<Machine[]>>(`/machines/location/${locationId}`),

    getActiveByLocationId: (locationId: number) =>
        api.get<ApiResponse<Machine[]>>(`/machines/location/${locationId}/active`),

    getAvailableByLocationId: (locationId: number) =>
        api.get<ApiResponse<Machine[]>>(`/machines/location/${locationId}/available`),

    create: (data: MachineRequest) =>
        api.post<ApiResponse<Machine>>('/machines', data),

    update: (id: number, data: MachineRequest) =>
        api.put<ApiResponse<Machine>>(`/machines/${id}`, data),

    setMaintenanceMode: (id: number, enabled: boolean) =>
        api.patch<ApiResponse<Machine>>(`/machines/${id}/maintenance?enabled=${enabled}`),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/machines/${id}`),
};
