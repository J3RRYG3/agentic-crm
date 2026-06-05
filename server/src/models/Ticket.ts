import mongoose, { Document, Schema, Types } from 'mongoose';
import type { TicketPriority, TicketStatus } from '../types';

export interface ITicket extends Document {
  code: string;
  contact: Types.ObjectId;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    code: { type: String, unique: true },
    contact: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['Baja', 'Media', 'Alta'] as TicketPriority[],
      default: 'Media',
    },
    status: {
      type: String,
      enum: ['Abierto', 'En Progreso', 'Resuelto'] as TicketStatus[],
      default: 'Abierto',
    },
  },
  { timestamps: true }
);

TicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.code) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.code = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);
