const API_BASE = '/api/v1';

export interface ApiError {
  message: string;
  status: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gymtech_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body?.error?.message || res.statusText, status: res.status } as ApiError;
  }
  if (res.status === 204) return {} as T;
  const json = await res.json();
  return json.success !== undefined && json.data !== undefined ? json.data : json;
}

async function download(path: string): Promise<Blob> {
  const token = localStorage.getItem('gymtech_token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw { message: 'Download failed', status: res.status } as ApiError;
  return res.blob();
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  documentNumber: string;
  role: string;
  status: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxOccupancy?: number;
  monthlyEntryLimit?: number | null;
}

export interface AttendanceStats {
  monthlyCheckIns: number;
  monthlyEntryLimit: number | null;
  remainingEntries: number | null;
  isCheckedIn: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface GymClass {
  id: string;
  name: string;
  capacity: number;
  enrolledCount?: number;
  instructor?: string;
  description?: string;
}

export interface Schedule {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  room: string;
  className?: string;
  enrolledCount?: number;
  capacity?: number;
}

export interface ClassReservation {
  id: string;
  classId: string;
  userId: string;
  createdAt: string;
  className: string;
  instructor: string;
  capacity: number;
  enrolledCount: number;
}

export interface Routine {
  id: string;
  name: string;
  title?: string;
  description?: string;
  difficultyLevel?: string;
  exercises?: Array<{ name: string; sets?: number; reps?: number }>;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  recordedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  createdAt?: string;
  timestamp?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  status: string;
}

export interface ClientLookup {
  userId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  subscriptionStatus: 'active' | 'expired' | 'suspended' | 'canceled';
  membershipName?: string;
  daysRemaining?: number;
  monthlyCheckIns?: number;
  monthlyEntryLimit?: number | null;
  remainingEntries?: number | null;
  isCheckedIn?: boolean;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<AuthUser>('/auth/me'),
    updateMe: (data: { firstName?: string; lastName?: string; password?: string }) =>
      request<AuthUser>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
    getUsers: () => request<{ users: AuthUser[] }>('/auth/users'),
    getClients: () => request<{ users: AuthUser[] }>('/auth/users/clients'),
    createUser: (data: Record<string, unknown>) =>
      request<AuthUser>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: string, data: Record<string, unknown>) =>
      request<AuthUser>(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request(`/auth/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    lookupByDoc: (doc: string) =>
      request<AuthUser>(`/auth/users/lookup/${encodeURIComponent(doc)}`),
  },
  membership: {
    getPlans: () => request<MembershipPlan[]>('/membership/plans'),
    createPlan: (data: Record<string, unknown>) =>
      request<MembershipPlan>('/membership/plans', { method: 'POST', body: JSON.stringify(data) }),
    getSubscriptions: () => request<Subscription[]>('/membership/subscriptions'),
    createSubscription: (userId: string, planId: string) =>
      request<Subscription>('/membership/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ userId, planId }),
      }),
    updateSubscriptionStatus: (id: string, status: string) =>
      request(`/membership/subscriptions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    validateSubscription: (userId: string) =>
      request<{ valid: boolean; subscription: Subscription }>(`/membership/subscriptions/validate/${userId}`),
    getOccupancy: () => request<{ current: number; max: number }>('/membership/occupancy/live'),
    getAttendanceStats: (userId: string) =>
      request<AttendanceStats>(`/membership/attendance/stats/${userId}`),
    registerAttendance: (userId: string, type: 'check_in' | 'check_out', idempotencyKey: string) =>
      request('/membership/attendance', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ userId, type }),
      }),
    recordPayment: (data: { userId: string; planId?: string; amount: number; method?: string }) =>
      request<Payment>('/membership/payments', { method: 'POST', body: JSON.stringify(data) }),
    listPayments: (fromDate: string, toDate: string) =>
      request<Payment[]>(`/membership/payments?fromDate=${fromDate}&toDate=${toDate}`),
    getDashboardStats: () =>
      request<{ occupancy: number; monthlyRevenue: number; churnRate: number; activeSubscriptions: number }>(
        '/membership/dashboard/stats'
      ),
  },
  activity: {
    getClasses: () => request<GymClass[]>('/activity/classes'),
    createClass: (data: Record<string, unknown>) =>
      request<GymClass>('/activity/classes', { method: 'POST', body: JSON.stringify(data) }),
    reserveClass: (classId: string, userId: string) =>
      request(`/activity/classes/${classId}/reservations`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    getMyReservations: () => request<ClassReservation[]>('/activity/reservations/mine'),
    getRoutines: () => request<Routine[]>('/activity/routines'),
    getMyRoutine: () => request<Routine | null>('/activity/routines/mine'),
    createRoutine: (data: Record<string, unknown>) =>
      request<Routine>('/activity/routines', { method: 'POST', body: JSON.stringify(data) }),
    assignRoutine: (routineId: string, userId: string) =>
      request('/activity/routines/assign', {
        method: 'POST',
        body: JSON.stringify({ routineId, userId }),
      }),
    getSchedules: () => request<Schedule[]>('/activity/schedules'),
    createSchedule: (data: Record<string, unknown>) =>
      request<Schedule>('/activity/schedules', { method: 'POST', body: JSON.stringify(data) }),
    getAssignedClients: () => request<Array<{ clientId: string; trainerId: string }>>('/activity/clients/assigned'),
    assignClient: (clientId: string) =>
      request('/activity/clients/assign', { method: 'POST', body: JSON.stringify({ clientId }) }),
  },
  reporting: {
    generateRevenue: (fromDate: string, toDate: string, format: 'pdf' | 'excel') =>
      request<{ id: string; contentBase64?: string }>('/reporting/reports/revenue', {
        method: 'POST',
        body: JSON.stringify({ fromDate, toDate, format }),
      }),
    generateAttendance: (fromDate: string, toDate: string, format: 'pdf' | 'excel') =>
      request<{ id: string; contentBase64?: string }>('/reporting/reports/attendance', {
        method: 'POST',
        body: JSON.stringify({ fromDate, toDate, format }),
      }),
    downloadReport: (id: string) => download(`/reporting/reports/${id}/download`),
    getAuditLogs: () => request<AuditLog[]>('/reporting/audit-logs'),
  },
  notification: {
    getByUser: (userId: string) => request<Notification[]>(`/notification/notifications/${userId}`),
  },
};

export async function lookupClient(doc: string): Promise<ClientLookup> {
  const user = await api.auth.lookupByDoc(doc);
  let subscriptionStatus: ClientLookup['subscriptionStatus'] = 'expired';
  let membershipName: string | undefined;
  let daysRemaining: number | undefined;

  try {
    const validation = await api.membership.validateSubscription(user.id);
    subscriptionStatus = (validation.subscription?.status as ClientLookup['subscriptionStatus']) || 'active';
    const end = new Date(validation.subscription.endDate);
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
    const plans = await api.membership.getPlans();
    membershipName = plans.find((p) => p.id === validation.subscription.planId)?.name;
  } catch {
    subscriptionStatus = 'expired';
  }

  if (user.status === 'inactive') subscriptionStatus = 'canceled';

  let monthlyCheckIns: number | undefined;
  let monthlyEntryLimit: number | null | undefined;
  let remainingEntries: number | null | undefined;
  let isCheckedIn: boolean | undefined;

  try {
    const stats = await api.membership.getAttendanceStats(user.id);
    monthlyCheckIns = stats.monthlyCheckIns;
    monthlyEntryLimit = stats.monthlyEntryLimit;
    remainingEntries = stats.remainingEntries;
    isCheckedIn = stats.isCheckedIn;
  } catch {
    // Sin stats si no hay suscripción activa
  }

  return {
    userId: user.id,
    firstName: user.firstName || 'Cliente',
    lastName: user.lastName || '',
    documentNumber: user.documentNumber,
    subscriptionStatus,
    membershipName,
    daysRemaining,
    monthlyCheckIns,
    monthlyEntryLimit,
    remainingEntries,
    isCheckedIn,
  };
}

export function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function toISOFromLocalDateTime(value: string): string {
  return new Date(value).toISOString();
}

export function downloadBase64Report(base64: string, filename: string, mime: string): void {
  const link = document.createElement('a');
  link.href = `data:${mime};base64,${base64}`;
  link.download = filename;
  link.click();
}
