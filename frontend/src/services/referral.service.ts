import apiClient from './api-client';

export const getReferrals = async (filter?: any) => {
  const { data } = await apiClient.get('/api/v1/referrals', { params: filter });
  const result = data?.data !== undefined ? data.data : data;
  return Array.isArray(result) ? result : [];
};

export const createReferral = async (referralData: any) => {
  const { data } = await apiClient.post('/api/v1/referrals', referralData);
  return data?.data || data;
};

export const getReferralAnalytics = async () => {
  const { data } = await apiClient.get('/api/v1/referrals/analytics');
  return data?.data || data;
};

export const markReferralConverted = async (id: string) => {
  const { data } = await apiClient.patch(`/api/v1/referrals/${id}/convert`);
  return data?.data || data;
};
