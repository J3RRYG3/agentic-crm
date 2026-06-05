import { Request, Response } from 'express';
import Campaign from '../models/Campaign';
import Contact from '../models/Contact';

export const getCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener campañas', error });
  }
};

export const createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la campaña', error });
  }
};

export const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }
    res.json({ message: 'Campaña eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la campaña', error });
  }
};

export const sendCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    if (campaign.status === 'Enviada') {
      res.status(400).json({ message: 'La campaña ya fue enviada anteriormente' });
      return;
    }

    const affectedContacts = await Contact.find({
      leadStatus: { $in: campaign.targetSegment },
    });

    const noteText = `Campaña "${campaign.name}" enviada — Asunto: "${campaign.emailSubject}"`;
    const noteDate = new Date();

    await Contact.updateMany(
      { leadStatus: { $in: campaign.targetSegment } },
      {
        $push: {
          notes: { text: noteText, date: noteDate },
        },
      }
    );

    campaign.status = 'Enviada';
    campaign.sentAt = noteDate;
    campaign.affectedContacts = affectedContacts.length;
    await campaign.save();

    res.json({
      message: `Campaña enviada a ${affectedContacts.length} contactos`,
      campaign,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar la campaña', error });
  }
};
