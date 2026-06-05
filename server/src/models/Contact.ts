import mongoose, { Document, Schema } from 'mongoose';
import type { LeadStatus } from '../types';

export interface INote {
  text: string;
  date: Date;
}

export interface IContact extends Document {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  leadStatus: LeadStatus;
  notes: INote[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    text: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ContactSchema = new Schema<IContact>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    leadStatus: {
      type: String,
      enum: ['Nuevo', 'Contactado', 'Cualificado', 'Inactivo'] as LeadStatus[],
      default: 'Nuevo',
    },
    notes: { type: [NoteSchema], default: [] },
  },
  { timestamps: true }
);

ContactSchema.index({ fullName: 'text', email: 'text', company: 'text' });

export default mongoose.model<IContact>('Contact', ContactSchema);
