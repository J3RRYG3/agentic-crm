import axios from 'axios';
import type {
  IContact,
  IOpportunity,
  ITicket,
  ICampaign,
  DashboardMetrics,
  CreateContactPayload,
  CreateOpportunityPayload,
  CreateTicketPayload,
  CreateCampaignPayload,
  LeadStatus,
  TicketStatus,
  TicketPriority,
} from '../types';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Contacts ──────────────────────────────────────────────────
export const contactsApi = {
  getAll: (params?: { search?: string; status?: LeadStatus | '' }) =>
    API.get<IContact[]>('/contacts', { params }).then((r) => r.data),

  getById: (id: string) =>
    API.get<IContact>(`/contacts/${id}`).then((r) => r.data),

  create: (payload: CreateContactPayload) =>
    API.post<IContact>('/contacts', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateContactPayload>) =>
    API.put<IContact>(`/contacts/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    API.delete<{ message: string }>(`/contacts/${id}`).then((r) => r.data),

  addNote: (id: string, text: string) =>
    API.post<IContact>(`/contacts/${id}/notes`, { text }).then((r) => r.data),
};

// ── Opportunities ─────────────────────────────────────────────
export const opportunitiesApi = {
  getAll: () =>
    API.get<IOpportunity[]>('/opportunities').then((r) => r.data),

  create: (payload: CreateOpportunityPayload) =>
    API.post<IOpportunity>('/opportunities', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateOpportunityPayload>) =>
    API.put<IOpportunity>(`/opportunities/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    API.delete<{ message: string }>(`/opportunities/${id}`).then((r) => r.data),
};

// ── Tickets ───────────────────────────────────────────────────
export const ticketsApi = {
  getAll: (params?: { status?: TicketStatus | ''; priority?: TicketPriority | '' }) =>
    API.get<ITicket[]>('/tickets', { params }).then((r) => r.data),

  create: (payload: CreateTicketPayload) =>
    API.post<ITicket>('/tickets', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateTicketPayload>) =>
    API.put<ITicket>(`/tickets/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    API.delete<{ message: string }>(`/tickets/${id}`).then((r) => r.data),
};

// ── Campaigns ─────────────────────────────────────────────────
export const campaignsApi = {
  getAll: () =>
    API.get<ICampaign[]>('/campaigns').then((r) => r.data),

  create: (payload: CreateCampaignPayload) =>
    API.post<ICampaign>('/campaigns', payload).then((r) => r.data),

  delete: (id: string) =>
    API.delete<{ message: string }>(`/campaigns/${id}`).then((r) => r.data),

  send: (id: string) =>
    API.post<{ message: string; campaign: ICampaign }>(`/campaigns/${id}/send`).then(
      (r) => r.data
    ),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  getMetrics: () =>
    API.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),
};
