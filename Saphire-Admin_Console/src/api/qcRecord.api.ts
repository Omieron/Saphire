import api from './axios';
import type { ApiResponse } from './auth.api';

export interface QcFormValue {
    id: number;
    fieldId: number;
    fieldKey: string;
    fieldLabel: string;
    valueText: string | null;
    valueNumber: number | null;
    valueBoolean: boolean | null;
    result: string | null;
    repeatIndex: number | null;
    groupKey: string | null;
}

export interface QcFormRecord {
    id: number;
    templateId: number;
    templateCode: string;
    templateName: string;
    machineId: number | null;
    machineName: string | null;
    productInstanceId: number | null;
    productInstanceSerial: string | null;
    productionStepId: number | null;
    filledById: number | null;
    filledByName: string | null;
    approvedById: number | null;
    approvedByName: string | null;
    status: string;
    overallResult: string | null;
    scheduledFor: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    startedAt: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    notes: string | null;
    values: QcFormValue[];
    createdAt: string;
}

export interface QcFormRecordRequest {
    templateId: number;
    machineId?: number;
    productInstanceId?: number;
    productionStepId?: number;
    scheduledFor?: string;
    periodStart?: string;
    periodEnd?: string;
    notes?: string;
}

export const qcRecordApi = {
    getAll: () =>
        api.get<ApiResponse<QcFormRecord[]>>('/qc-records'),

    getById: (id: number) =>
        api.get<ApiResponse<QcFormRecord>>(`/qc-records/${id}`),

    getByTemplateId: (templateId: number) =>
        api.get<ApiResponse<QcFormRecord[]>>(`/qc-records/template/${templateId}`),

    getByMachineId: (machineId: number) =>
        api.get<ApiResponse<QcFormRecord[]>>(`/qc-records/machine/${machineId}`),

    getByStatus: (status: string) =>
        api.get<ApiResponse<QcFormRecord[]>>(`/qc-records/status/${status}`),

    getPending: () =>
        api.get<ApiResponse<QcFormRecord[]>>('/qc-records/pending'),

    create: (data: QcFormRecordRequest) =>
        api.post<ApiResponse<QcFormRecord>>('/qc-records', data),

    submit: (id: number) =>
        api.post<ApiResponse<QcFormRecord>>(`/qc-records/${id}/submit`),

    approve: (id: number) =>
        api.post<ApiResponse<QcFormRecord>>(`/qc-records/${id}/approve`),

    reject: (id: number, reason: string) =>
        api.post<ApiResponse<QcFormRecord>>(`/qc-records/${id}/reject?reason=${encodeURIComponent(reason)}`),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/qc-records/${id}`),
};
