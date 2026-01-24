import axios from 'axios';

// Backend API Base URL - Raspberry Pi
const API_BASE_URL = 'http://localhost:8080';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

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
    submit: (id: number) => axios.post(`/api/v1/qc-records/${id}/submit`),
    getMyRecords: () => axios.get('/api/v1/qc-records/my'),
};

// Product API
export const productApi = {
    getAll: () => axios.get('/api/v1/products'),
    getById: (id: number) => axios.get(`/api/v1/products/${id}`),
};

// Task Assignment API
export const taskAssignmentApi = {
    getAll: () => axios.get('/api/v1/task-assignments'),
    getActiveTasks: (userId: number) => axios.get(`/api/v1/task-assignments/active/${userId}`),
};

