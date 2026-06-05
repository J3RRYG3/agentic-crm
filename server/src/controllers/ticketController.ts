import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import type { TicketPriority, TicketStatus } from '../types';

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      filter.status = status as TicketStatus;
    }
    if (priority && typeof priority === 'string') {
      filter.priority = priority as TicketPriority;
    }

    const tickets = await Ticket.find(filter)
      .populate('contact', 'fullName email company')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets', error });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      'contact',
      'fullName email company'
    );
    if (!ticket) {
      res.status(404).json({ message: 'Ticket no encontrado' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el ticket', error });
  }
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    const populated = await ticket.populate('contact', 'fullName email company');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el ticket', error });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('contact', 'fullName email company');

    if (!ticket) {
      res.status(404).json({ message: 'Ticket no encontrado' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el ticket', error });
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Ticket no encontrado' });
      return;
    }
    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el ticket', error });
  }
};
