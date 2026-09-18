import apiClient from './api-client';

export const getFeedbacks = async (filter?: any) => {
  const { data } = await apiClient.get('/api/v1/feedback', { params: filter });
  const result = data?.data !== undefined ? data.data : data;
  return Array.isArray(result) ? result : [];
};

export const createFeedback = async (feedbackData: any) => {
  const { data } = await apiClient.post('/api/v1/feedback', feedbackData);
  return data?.data !== undefined ? data.data : data;
};

export const getNpsSummary = async () => {
  const { data } = await apiClient.get('/api/v1/feedback/nps-summary');
  return data?.data !== undefined ? data.data : data;
};

export const getDoctorRatings = async () => {
  const { data } = await apiClient.get('/api/v1/feedback/doctor-ratings');
  return data?.data !== undefined ? data.data : data;
};
