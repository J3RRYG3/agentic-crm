import { Request, Response } from 'express';
import Contact from '../models/Contact';
import Opportunity from '../models/Opportunity';
import Ticket from '../models/Ticket';
import Campaign from '../models/Campaign';
import type { DashboardMetrics, PipelineStage, TicketPriority, TicketStatus } from '../types';

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalContacts,
      wonOpportunities,
      totalOpportunities,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      sentCampaigns,
      pipelineAgg,
      ticketStatusAgg,
      ticketPriorityAgg,
      pipelineValueAgg,
    ] = await Promise.all([
      Contact.countDocuments(),
      Opportunity.countDocuments({ stage: 'Ganado' }),
      Opportunity.countDocuments(),
      Ticket.countDocuments({ status: 'Abierto' }),
      Ticket.countDocuments({ status: 'En Progreso' }),
      Ticket.countDocuments({ status: 'Resuelto' }),
      Campaign.countDocuments({ status: 'Enviada' }),
      Opportunity.aggregate<{ _id: PipelineStage; count: number; totalValue: number }>([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Ticket.aggregate<{ _id: TicketStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate<{ _id: TicketPriority; count: number }>([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate<{ _id: null; total: number }>([
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
    ]);

    const totalPipelineValue =
      pipelineValueAgg.length > 0 ? pipelineValueAgg[0].total : 0;

    const conversionRate =
      totalOpportunities > 0
        ? Math.round((wonOpportunities / totalOpportunities) * 100 * 10) / 10
        : 0;

    const metrics: DashboardMetrics = {
      totalPipelineValue,
      conversionRate,
      wonOpportunities,
      totalOpportunities,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      sentCampaigns,
      totalContacts,
      pipelineByStage: pipelineAgg.map((item) => ({
        stage: item._id,
        count: item.count,
        totalValue: item.totalValue,
      })),
      ticketsByStatus: ticketStatusAgg.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      ticketsByPriority: ticketPriorityAgg.map((item) => ({
        priority: item._id,
        count: item.count,
      })),
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métricas del dashboard', error });
  }
};
