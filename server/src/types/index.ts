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
