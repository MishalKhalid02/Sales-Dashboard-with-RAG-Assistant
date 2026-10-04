import apiClient from './client';

export async function sendChatMessage(message, history = []) {
  const response = await apiClient.post('/chat', { message, history });
  return response.data;
}

export async function transcribeAudio(audio, mimeType = 'audio/m4a') {
  const response = await apiClient.post('/chat/transcribe', { audio, mimeType });
  return response.data.transcript;
}
