import { useState, useEffect } from 'react';
import { X, Plus, MessageSquare } from 'lucide-react';
import type { IContact, CreateContactPayload, LeadStatus } from '../types';

const LEAD_STATUSES: LeadStatus[] = ['Nuevo', 'Contactado', 'Cualificado', 'Inactivo'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  Nuevo: 'bg-blue-100 text-blue-700',
  Contactado: 'bg-yellow-100 text-yellow-700',
  Cualificado: 'bg-green-100 text-green-700',
  Inactivo: 'bg-gray-100 text-gray-600',
};

interface ContactModalProps {
  contact: IContact | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (payload: CreateContactPayload) => Promise<void>;
  onAddNote: (contactId: string, text: string) => Promise<void>;
}

const emptyForm: CreateContactPayload = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  leadStatus: 'Nuevo',
};

export default function ContactModal({
  contact,
  mode,
  onClose,
  onSave,
  onAddNote,
}: ContactModalProps) {
  const [form, setForm] = useState<CreateContactPayload>(emptyForm);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');

  useEffect(() => {
    if (contact && mode !== 'create') {
      setForm({
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        position: contact.position,
        leadStatus: contact.leadStatus,
      });
    } else {
      setForm(emptyForm);
    }
  }, [contact, mode]);

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

  const handleAddNote = async () => {
    if (!noteText.trim() || !contact) return;
    setAddingNote(true);
    try {
      await onAddNote(contact._id, noteText);
      setNoteText('');
    } finally {
      setAddingNote(false);
    }
  };

  const isReadOnly = mode === 'view';
  const title =
    mode === 'create'
      ? 'Nuevo Contacto'
      : mode === 'edit'
      ? 'Editar Contacto'
      : contact?.fullName ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {contact && mode === 'view' && (
              <span className={`badge mt-1 ${STATUS_COLORS[contact.leadStatus]}`}>
                {contact.leadStatus}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs (only in view mode) */}
        {mode === 'view' && (
          <div className="flex border-b border-gray-100 px-6">
            {(['details', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'details' ? 'Detalles' : `Notas (${contact?.notes.length ?? 0})`}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {(mode === 'create' || mode === 'edit' || activeTab === 'details') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    className="input-field"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    readOnly={isReadOnly}
                    placeholder="Ej. Juan García López"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Compañía</label>
                  <input
                    className="input-field"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
                  <input
                    className="input-field"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Estado del Lead
                  </label>
                  {isReadOnly ? (
                    <span className={`badge ${STATUS_COLORS[form.leadStatus]}`}>
                      {form.leadStatus}
                    </span>
                  ) : (
                    <select
                      className="select-field"
                      value={form.leadStatus}
                      onChange={(e) =>
                        setForm({ ...form, leadStatus: e.target.value as LeadStatus })
                      }
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="btn-secondary" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : mode === 'create' ? 'Crear Contacto' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          )}

          {mode === 'view' && activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add note */}
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Escribe una nota..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !noteText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>

              {/* Notes list */}
              {contact && contact.notes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notas todavía</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contact?.notes
                    .slice()
                    .reverse()
                    .map((note, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <p className="text-sm text-gray-700">{note.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(note.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
