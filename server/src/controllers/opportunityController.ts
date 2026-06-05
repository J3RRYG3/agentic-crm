import { Request, Response } from 'express';
import Opportunity from '../models/Opportunity';

export const getOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunities = await Opportunity.find()
      .populate('contact', 'fullName email company')
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener oportunidades', error });
  }
};

export const getOpportunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'contact',
      'fullName email company'
    );
    if (!opportunity) {
      res.status(404).json({ message: 'Oportunidad no encontrada' });
      return;
    }
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la oportunidad', error });
  }
};

export const createOpportunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunity = new Opportunity(req.body);
    await opportunity.save();
    const populated = await opportunity.populate('contact', 'fullName email company');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la oportunidad', error });
  }
};

export const updateOpportunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('contact', 'fullName email company');

    if (!opportunity) {
      res.status(404).json({ message: 'Oportunidad no encontrada' });
      return;
    }
    res.json(opportunity);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la oportunidad', error });
  }
};

export const deleteOpportunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      res.status(404).json({ message: 'Oportunidad no encontrada' });
      return;
    }
    res.json({ message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la oportunidad', error });
  }
};
