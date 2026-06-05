import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Users, Clock, CheckCircle, X } from 'lucide-react';
import { campaignsApi } from '../services/api';
import type { ICampaign, CreateCampaignPayload, LeadStatus, CampaignStatus } from '../types';

const LEAD_STATUSES: LeadStatus[] = ['Nuevo', 'Contactado', 'Cualificado', 'Inactivo'];

const STATUS_STYLES: Record<CampaignStatus, { container: string; badge: string; icon: React.ReactNode }> = {
  Borrador: {
    container: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    icon: <Clock size={13} />,
  },
  Enviada: {
    container: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    icon: <CheckCircle size={13} />,
  },
};

const emptyForm: CreateCampaignPayload = {
  name: '',
  targetSegment: [],
  emailSubject: '',
  emailBody: '',
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCampaignPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await campaignsApi.getAll();
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleSegment = (status: LeadStatus) => {
    setForm((prev) => ({
      ...prev,
      targetSegment: prev.targetSegment.includes(status)
        ? prev.targetSegment.filter((s) => s !== status)
        : [...prev.targetSegment, status],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.targetSegment.length === 0) {
      alert('Selecciona al menos un segmento objetivo.');
      return;
    }
    setSaving(true);
    try {
      const created = await campaignsApi.create(form);
      setCampaigns((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id: string, name: string) => {
    if (!window.confirm(`¿Enviar la campaña "${name}"? Esta acción no se puede deshacer.`)) return;
    setSendingId(id);
    try {
      const result = await campaignsApi.send(id);
      setCampaigns((prev) => prev.map((c) => (c._id === id ? result.campaign : c)));
      alert(result.message);
    } catch (err) {
      alert('Error al enviar la campaña. Inténtalo de nuevo.');
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta campaña?')) return;
    await campaignsApi.delete(id);
    setCampaigns((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing y Campañas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {campaigns.filter((c) => c.status === 'Enviada').length} enviadas ·{' '}
            {campaigns.filter((c) => c.status === 'Borrador').length} en borrador
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nueva Campaña
        </button>
      </div>

      {/* Create Campaign Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Campaña</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleCreate(e)}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre de la Campaña
                </label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ej. Campaña Bienvenida Q3 2024"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Segmento Objetivo (Selecciona los estados de lead a incluir)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEAD_STATUSES.map((status) => {
                    const selected = form.targetSegment.includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleSegment(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
                {form.targetSegment.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Segmentos: {form.targetSegment.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Asunto del Email
                </label>
                <input
                  className="input-field"
                  value={form.emailSubject}
                  onChange={(e) => setForm({ ...form, emailSubject: e.target.value })}
                  required
                  placeholder="Ej. ¡Descubre nuestras novedades!"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cuerpo del Email
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={5}
                  value={form.emailBody}
                  onChange={(e) => setForm({ ...form, emailBody: e.target.value })}
                  required
                  placeholder="Escribe el contenido del email aquí..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar como Borrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando campañas...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No hay campañas creadas todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const styles = STATUS_STYLES[campaign.status];
            const isSending = sendingId === campaign._id;

            return (
              <div
                key={campaign._id}
                className={`card p-5 border-2 flex flex-col ${styles.container}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 leading-tight">{campaign.name}</h3>
                  <span
                    className={`badge shrink-0 flex items-center gap-1 ${styles.badge}`}
                  >
                    {styles.icon}
                    {campaign.status}
                  </span>
                </div>

                {/* Segments */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {campaign.targetSegment.map((seg) => (
                    <span
                      key={seg}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {seg}
                    </span>
                  ))}
                </div>

                {/* Email Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3 flex-1">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Asunto: {campaign.emailSubject}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-3">{campaign.emailBody}</p>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>
                      {campaign.status === 'Enviada'
                        ? `${campaign.affectedContacts} contactos`
                        : 'Aún no enviada'}
                    </span>
                  </div>
                  {campaign.sentAt && (
                    <span>
                      {new Date(campaign.sentAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {campaign.status === 'Borrador' && (
                    <button
                      className="btn-primary flex-1 justify-center"
                      onClick={() => void handleSend(campaign._id, campaign.name)}
                      disabled={isSending}
                    >
                      <Send size={14} />
                      {isSending ? 'Enviando...' : 'Enviar Campaña'}
                    </button>
                  )}
                  <button
                    onClick={() => void handleDelete(campaign._id)}
                    className="btn-danger shrink-0"
                    title="Eliminar campaña"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
