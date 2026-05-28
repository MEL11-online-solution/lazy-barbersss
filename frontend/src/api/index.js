import client from './client';

export const servicesApi = {
  list: () => client.get('/services').then((r) => r.data),
  listAdmin: () => client.get('/services/admin/all').then((r) => r.data),
  get: (id) => client.get(`/services/${id}`).then((r) => r.data),
  create: (payload) => client.post('/services', payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/services/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/services/${id}`).then((r) => r.data),
};

export const barbersApi = {
  list: () => client.get('/barbers').then((r) => r.data),
  listAll: () => client.get('/barbers/admin/all').then((r) => r.data),
  get: (id) => client.get(`/barbers/${id}`).then((r) => r.data),
  getSchedule: (id) => client.get(`/barbers/${id}/schedule`).then((r) => r.data),
  create: (payload) => client.post('/barbers', payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/barbers/${id}`, payload).then((r) => r.data),
  setSchedule: (id, schedule) => client.patch(`/barbers/${id}/schedule`, { schedule }).then((r) => r.data),
  remove: (id) => client.delete(`/barbers/${id}`).then((r) => r.data),
};

export const availabilityApi = {
  get: ({ service_id, barber_id, date }) =>
    client
      .get('/availability', { params: { service_id, ...(barber_id ? { barber_id } : {}), date } })
      .then((r) => r.data),
      now: () => client.get('/availability/now').then((r) => r.data),
};

export const bookingsApi = {
  create: (payload) => client.post('/bookings', payload).then((r) => r.data),
  listMine: () => client.get('/bookings/me').then((r) => r.data),
  get: (id) => client.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id) => client.patch(`/bookings/${id}/cancel`).then((r) => r.data),
  reschedule: (id, new_start_at) =>
    client.patch(`/bookings/${id}/reschedule`, { new_start_at }).then((r) => r.data),
  setStatus: (id, status) => client.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
  receipt: (id) => client.get(`/bookings/${id}/receipt`).then((r) => r.data),
};

export const customerApi = {
  me: () => client.get('/customer/me').then((r) => r.data),
  updateMe: (payload) => client.patch('/customer/me', payload).then((r) => r.data),
};

export const barberPortalApi = {
  me: () => client.get('/barber/me').then((r) => r.data),
  schedule: () => client.get('/barber/me/schedule').then((r) => r.data),
  appointments: (status) =>
    client.get('/barber/me/appointments', { params: status ? { status } : {} }).then((r) => r.data),
  appointmentsToday: () => client.get('/barber/me/appointments/today').then((r) => r.data),
  timeOff: () => client.get('/barber/me/time-off').then((r) => r.data),
  requestTimeOff: (payload) => client.post('/barber/me/time-off', payload).then((r) => r.data),
};

export const adminApi = {
  stats: () => client.get('/admin/dashboard/stats').then((r) => r.data),
  bookings: (params) => client.get('/admin/bookings', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  recentBookings: (since) =>
    client.get('/admin/recent-bookings', { params: since ? { since } : {} }).then((r) => r.data),
  schedule: (date) => client.get('/admin/schedule', { params: date ? { date } : {} }).then((r) => r.data),
  customers: (params) => client.get('/admin/customers', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  customerDetail: (id) => client.get(`/admin/customers/${id}`).then((r) => r.data),
  revenueChart: (days = 30) =>
    client.get('/admin/revenue/chart', { params: { days } }).then((r) => r.data),
  revenue: (period) => client.get('/admin/revenue', { params: { period } }).then((r) => r.data),
  transactions: (params) =>
    client.get('/admin/revenue/transactions', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  timeOffRequests: () => client.get('/admin/time-off-requests').then((r) => r.data),
  reviewTimeOff: (id, status) =>
    client.patch(`/admin/time-off-requests/${id}`, { status }).then((r) => r.data),
  contactMessages: () =>
    client.get('/admin/contact-messages').then((r) => ({ rows: r.data, meta: r.meta })),
  markContactRead: (id) => client.patch(`/admin/contact-messages/${id}/read`).then((r) => r.data),
  notifications: (params) =>
    client.get('/admin/notifications', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  auditLogs: (params) =>
    client.get('/admin/audit-logs', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  clubMembers: (params) =>
    client.get('/admin/club-members', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  deleteClubMember: (id) => client.delete(`/admin/club-members/${id}`).then((r) => r.data),
};

export const contactApi = {
  send: (payload) => client.post('/contact', payload).then((r) => r.data),
};

export const reviewsApi = {
  list: (params) => client.get('/reviews', { params }).then((r) => ({ rows: r.data, meta: r.meta })),
  create: (payload) => client.post('/reviews', payload).then((r) => r.data),
};

export const clubApi = {
  join: (payload) => client.post('/club/join', payload).then((r) => r.data),
};

export const chatbotApi = {
  message: (message) => client.post('/chatbot/message', { message }).then((r) => r.data),
};
