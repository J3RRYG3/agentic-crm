import mongoose, { Document, Schema, Types } from 'mongoose';
import type { PipelineStage } from '../types';

export interface IOpportunity extends Document {
  title: string;
  contact: Types.ObjectId;
  value: number;
  stage: PipelineStage;
  closingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true, trim: true },
    contact: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: [
        'Prospecto',
        'Calificado',
        'Propuesta',
        'Negociación',
        'Ganado',
        'Perdido',
      ] as PipelineStage[],
      default: 'Prospecto',
    },
    closingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
