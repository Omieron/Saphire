import api from './axios';
import type { ApiResponse } from './auth.api';

export interface QcFormField {
    id: number;
    fieldKey: string;
    label: string;
    inputType: string;
    fieldOrder: number;
    required: boolean;
    minValue: number | null;
    maxValue: number | null;
    targetValue: number | null;
    tolerance: number | null;
    unit: string | null;
    options: string[] | null; // For SELECT type
}

export interface QcFormSection {
    id: number;
    name: string;
    description: string | null;
    sectionOrder: number;
    isRepeatable: boolean;
    repeatCount: number | null;
    fields: QcFormField[];
}

export interface QcFormTemplate {
    id: number;
    code: string;
    name: string;
    description: string | null;
    contextType: string;
    scheduleType: string | null;
    version: number;
    active: boolean;
    requiresApproval: boolean;
    allowPartialSave: boolean;
    companyId: number | null;
    companyName: string | null;
    machineIds: number[];
    machineNames: string | null;
    machineCodes: string | null;
    productId: number | null;
    productName: string | null;
    sections: QcFormSection[];
    createdAt: string;
    updatedAt: string;
}

export interface QcFormFieldRequest {
    fieldOrder: number;
    fieldKey: string;
    label: string;
    inputType: string;
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    tolerance?: number;
    unit?: string;
    decimalPlaces?: number;
    options?: string[];
    required?: boolean;
    failCondition?: string;
    helpText?: string;
    placeholder?: string;
    width?: string;
}

export interface QcFormSectionRequest {
    sectionOrder: number;
    name: string;
    description?: string;
    isRepeatable?: boolean;
    repeatCount?: number;
    repeatLabelPattern?: string;
    hasGroups?: boolean;
    groupLabels?: string[];
    fields?: QcFormFieldRequest[];
}

export interface QcFormTemplateRequest {
    code: string;
    name: string;
    description?: string;
    contextType: string;
    scheduleType?: string;
    active?: boolean;
    requiresApproval?: boolean;
    allowPartialSave?: boolean;
    companyId?: number;
    machineIds?: number[];
    productId?: number;
    headerFields?: object[];
    sections?: QcFormSectionRequest[];
}

export const qcTemplateApi = {
    getAll: (search?: string) =>
        api.get<ApiResponse<QcFormTemplate[]>>(`/qc-templates${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    getById: (id: number) =>
        api.get<ApiResponse<QcFormTemplate>>(`/qc-templates/${id}`),

    getByCode: (code: string) =>
        api.get<ApiResponse<QcFormTemplate>>(`/qc-templates/code/${code}`),

    getByMachineId: (machineId: number) =>
        api.get<ApiResponse<QcFormTemplate[]>>(`/qc-templates/machine/${machineId}`),

    getByProductId: (productId: number) =>
        api.get<ApiResponse<QcFormTemplate[]>>(`/qc-templates/product/${productId}`),

    getByContextType: (contextType: string) =>
        api.get<ApiResponse<QcFormTemplate[]>>(`/qc-templates/context/${contextType}`),

    getActive: () =>
        api.get<ApiResponse<QcFormTemplate[]>>('/qc-templates/active'),

    create: (data: QcFormTemplateRequest) =>
        api.post<ApiResponse<QcFormTemplate>>('/qc-templates', data),

    update: (id: number, data: QcFormTemplateRequest) =>
        api.put<ApiResponse<QcFormTemplate>>(`/qc-templates/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/qc-templates/${id}`),
};
