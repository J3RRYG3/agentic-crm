import { Request, Response } from 'express';
import Contact from '../models/Contact';
import type { LeadStatus } from '../types';

export const getContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      filter.leadStatus = status as LeadStatus;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { company: regex },
        { phone: regex },
      ];
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contactos', error });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el contacto', error });
  }
};

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el contacto', error });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el contacto', error });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el contacto', error });
  }
};

export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body as { text: string };
    if (!text || text.trim() === '') {
      res.status(400).json({ message: 'El texto de la nota es requerido' });
      return;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: { text: text.trim(), date: new Date() },
        },
      },
      { new: true }
    );

    if (!contact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar nota', error });
  }
};
