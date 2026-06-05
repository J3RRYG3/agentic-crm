export type LeadStatus = 'Nuevo' | 'Contactado' | 'Cualificado' | 'Inactivo';

export type PipelineStage =
  | 'Prospecto'
  | 'Calificado'
  | 'Propuesta'
  | 'Negociación'
  | 'Ganado'
  | 'Perdido';

export type TicketPriority = 'Baja' | 'Media' | 'Alta';

export type TicketStatus = 'Abierto' | 'En Progreso' | 'Resuelto';

export type CampaignStatus = 'Borrador' | 'Enviada';

export interface INote {
  text: string;
  date: string;
}

export interface IContact {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  leadStatus: LeadStatus;
  notes: INote[];
  createdAt: string;
  updatedAt: string;
}

export interface IContactPopulated {
  _id: string;
  fullName: string;
  email: string;
  company: string;
}

export interface IOpportunity {
  _id: string;
  title: string;
  contact: IContactPopulated;
  value: number;
  stage: PipelineStage;
  closingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITicket {
  _id: string;
  code: string;
  contact: IContactPopulated;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICampaign {
  _id: string;
  name: string;
  targetSegment: LeadStatus[];
  emailSubject: string;
  emailBody: string;
  status: CampaignStatus;
  sentAt?: string;
  affectedContacts: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalPipelineValue: number;
  conversionRate: number;
  wonOpportunities: number;
  totalOpportunities: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  sentCampaigns: number;
  totalContacts: number;
  pipelineByStage: Array<{ stage: PipelineStage; count: number; totalValue: number }>;
  ticketsByStatus: Array<{ status: TicketStatus; count: number }>;
  ticketsByPriority: Array<{ priority: TicketPriority; count: number }>;
}

export interface CreateContactPayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  leadStatus: LeadStatus;
}

export interface CreateOpportunityPayload {
  title: string;
  contact: string;
  value: number;
  stage: PipelineStage;
  closingDate: string;
}

export interface CreateTicketPayload {
  contact: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface CreateCampaignPayload {
  name: string;
  targetSegment: LeadStatus[];
  emailSubject: string;
  emailBody: string;
}
