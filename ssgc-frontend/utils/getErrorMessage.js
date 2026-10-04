// utils/getErrorMessage.js
export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data?.error;
  if (typeof data === 'string' && data.length > 0) return data;
  return fallback;
}