import api from './axios';
import type { ApiResponse, User as UserResponse } from './auth.api';

export type TaskAssignmentType = 'ONCE' | 'RECURRING';

export interface TaskSchedule {
    id?: number;
    dayOfWeek?: number;
    specificDate?: string;
    startTime: string;
    endTime: string;
}

export interface TaskAssignment {
    id: number;
    templateId: number;
    templateName: string;
    templateCode: string;
    type: TaskAssignmentType;
    machineId: number | null;
    machineName?: string | null;
    productId: number | null;
    productName?: string | null;
    assignedUsers: UserResponse[];
    schedules: TaskSchedule[];
    active: boolean;
}

export interface TaskAssignmentRequest {
    templateId: number;
    type: TaskAssignmentType;
    machineId: number | null;
    productId: number | null;
    userIds: number[];
    schedules: TaskSchedule[];
}

export const taskAssignmentApi = {
    getAll: () =>
        api.get<ApiResponse<TaskAssignment[]>>('/task-assignments'),

    create: (data: TaskAssignmentRequest) =>
        api.post<ApiResponse<TaskAssignment>>('/task-assignments', data),

    update: (id: number, data: TaskAssignmentRequest) =>
        api.put<ApiResponse<TaskAssignment>>(`/task-assignments/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/task-assignments/${id}`),

    getActiveTasks: (userId: number) =>
        api.get<ApiResponse<TaskAssignment[]>>(`/task-assignments/active/${userId}`),
};
