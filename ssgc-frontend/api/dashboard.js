
import apiClient from './client';

export async function fetchKpis(filters = {}) {
  const response = await apiClient.get('/kpis', { params: filters });
  return response.data;
}

export async function fetchRegionBreakdown(filters = {}) {
  const response = await apiClient.get('/regions', { params: filters });
  return response.data;
}

export async function fetchTrend(filters = {}, months = 12) {
  const response = await apiClient.get('/trend', { params: { ...filters, months } });
  return response.data;
}

export async function fetchBillingRecords(filters = {}, page = 1, pageSize = 50) {
  const response = await apiClient.get('/billing-records', {
    params: { ...filters, page, pageSize }
  });
  return response.data;
}

