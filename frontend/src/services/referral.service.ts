import apiClient from './api-client';

export const getReferrals = async (filter?: any) => {
  const { data } = await apiClient.get('/api/v1/referrals', { params: filter });
  return data;
};

export const createReferral = async (referralData: any) => {
  const { data } = await apiClient.post('/api/v1/referrals', referralData);
  return data;
};

export const getReferralAnalytics = async () => {
  const { data } = await apiClient.get('/api/v1/referrals/analytics');
  return data;
};

export const markReferralConverted = async (id: string) => {
  const { data } = await apiClient.patch(`/api/v1/referrals/${id}/convert`);
  return data;
};
