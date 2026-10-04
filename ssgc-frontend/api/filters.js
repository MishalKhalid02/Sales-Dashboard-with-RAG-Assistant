import apiClient from './client';

export const fetchMonths = () => apiClient.get('/filters/months').then(r => r.data);
export const fetchUnits = () => apiClient.get('/filters/units').then(r => r.data);
export const fetchRegions = (unit) => apiClient.get('/filters/regions', { params: { unit } }).then(r => r.data);
export const fetchZones = (region) => apiClient.get('/filters/zones', { params: { region } }).then(r => r.data);
export const fetchSubzones = (zone) => apiClient.get('/filters/subzones', { params: { zone } }).then(r => r.data);
export const fetchAreas = (subzone) => apiClient.get('/filters/areas', { params: { subzone } }).then(r => r.data);
export const fetchMainClasses = () => apiClient.get('/filters/main-classes').then(r => r.data);
export const fetchCustomerClasses = (mainClass) => apiClient.get('/filters/customer-classes', { params: { mainClass } }).then(r => r.data);