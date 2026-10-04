import apiClient from './client';

export async function sendChatMessage(message, history = []) {
  const response = await apiClient.post('/chat', { message, history });
  return response.data;
}