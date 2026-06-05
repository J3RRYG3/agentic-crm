import mongoose, { Document, Schema } from 'mongoose';
import type { CampaignStatus, LeadStatus } from '../types';

export interface ICampaign extends Document {
  name: string;
  targetSegment: LeadStatus[];
  emailSubject: string;
  emailBody: string;
  status: CampaignStatus;
  sentAt?: Date;
  affectedContacts: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    targetSegment: {
      type: [String],
      enum: ['Nuevo', 'Contactado', 'Cualificado', 'Inactivo'] as LeadStatus[],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Se requiere al menos un segmento objetivo',
      },
    },
    emailSubject: { type: String, required: true, trim: true },
    emailBody: { type: String, required: true },
    status: {
      type: String,
      enum: ['Borrador', 'Enviada'] as CampaignStatus[],
      default: 'Borrador',
    },
    sentAt: { type: Date },
    affectedContacts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
