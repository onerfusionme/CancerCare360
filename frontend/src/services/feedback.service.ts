import apiClient from './api-client';

export const getFeedbacks = async (filter?: any) => {
  const { data } = await apiClient.get('/api/v1/feedback', { params: filter });
  return data;
};

export const createFeedback = async (feedbackData: any) => {
  const { data } = await apiClient.post('/api/v1/feedback', feedbackData);
  return data;
};

export const getNpsSummary = async () => {
  const { data } = await apiClient.get('/api/v1/feedback/nps-summary');
  return data;
};

export const getDoctorRatings = async () => {
  const { data } = await apiClient.get('/api/v1/feedback/doctor-ratings');
  return data;
};
