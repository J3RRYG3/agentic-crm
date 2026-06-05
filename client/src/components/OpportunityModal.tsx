import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { IOpportunity, IContact, CreateOpportunityPayload, PipelineStage } from '../types';

const PIPELINE_STAGES: PipelineStage[] = [
  'Prospecto',
  'Calificado',
  'Propuesta',
  'Negociación',
  'Ganado',
  'Perdido',
];

interface OpportunityModalProps {
  opportunity: IOpportunity | null;
  contacts: IContact[];
  onClose: () => void;
  onSave: (payload: CreateOpportunityPayload) => Promise<void>;
}

const emptyForm: CreateOpportunityPayload = {
  title: '',
  contact: '',
  value: 0,
  stage: 'Prospecto',
  closingDate: '',
};

export default function OpportunityModal({
  opportunity,
  contacts,
  onClose,
  onSave,
}: OpportunityModalProps) {
  const [form, setForm] = useState<CreateOpportunityPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setForm({
        title: opportunity.title,
        contact:
          typeof opportunity.contact === 'object'
            ? opportunity.contact._id
            : opportunity.contact,
        value: opportunity.value,
        stage: opportunity.stage,
        closingDate: opportunity.closingDate.slice(0, 10),
      });
    } else {
      setForm(emptyForm);
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const title = opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Ej. Contrato anual TechCorp"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contacto</label>
            <select
              className="select-field"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            >
              <option value="">Seleccionar contacto...</option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} — {c.company}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Valor ($)
              </label>
              <input
                type="number"
                className="input-field"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Etapa</label>
              <select
                className="select-field"
                value={form.stage}
                onChange={(e) =>
                  setForm({ ...form, stage: e.target.value as PipelineStage })
                }
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha de Cierre Estimada
            </label>
            <input
              type="date"
              className="input-field"
              value={form.closingDate}
              onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : opportunity ? 'Guardar Cambios' : 'Crear Oportunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
