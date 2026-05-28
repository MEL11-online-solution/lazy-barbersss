import client from './client';

export const authApi = {
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  verifyEmail: (payload) => client.post('/auth/verify-email', payload).then((r) => r.data),
  resendVerification: (email) => client.post('/auth/resend-verification', { email }).then((r) => r.data),
  login: (payload) => client.post('/auth/login', payload).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (payload) => client.post('/auth/reset-password', payload).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
  providers: () => client.get('/auth/providers').then((r) => r.data),
};
