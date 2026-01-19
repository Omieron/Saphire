import axios from 'axios';

// Machine API
export const machineApi = {
    getAll: () => axios.get('/api/v1/machines'),
    getById: (id: number) => axios.get(`/api/v1/machines/${id}`),
};

// QC Template API
export const templateApi = {
    getAll: () => axios.get('/api/v1/qc-templates'),
    getById: (id: number) => axios.get(`/api/v1/qc-templates/${id}`),
    getByMachine: (machineId: number) => axios.get(`/api/v1/qc-templates?machineId=${machineId}`),
};

// QC Record API
export const recordApi = {
    create: (data: any) => axios.post('/api/v1/qc-records', data),
    getMyRecords: () => axios.get('/api/v1/qc-records/my'),
};

// Product API
export const productApi = {
    getAll: () => axios.get('/api/v1/products'),
    getById: (id: number) => axios.get(`/api/v1/products/${id}`),
};
