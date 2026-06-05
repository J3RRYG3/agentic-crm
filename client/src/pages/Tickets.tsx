import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { ticketsApi, contactsApi } from '../services/api';
import type {
  ITicket,
  IContact,
  CreateTicketPayload,
  TicketStatus,
  TicketPriority,
} from '../types';

const STATUSES: TicketStatus[] = ['Abierto', 'En Progreso', 'Resuelto'];
const PRIORITIES: TicketPriority[] = ['Baja', 'Media', 'Alta'];

const STATUS_STYLES: Record<TicketStatus, string> = {
  Abierto: 'bg-red-100 text-red-700',
  'En Progreso': 'bg-yellow-100 text-yellow-700',
  Resuelto: 'bg-green-100 text-green-700',
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Alta: 'bg-red-500 text-white',
  Media: 'bg-yellow-500 text-white',
  Baja: 'bg-green-500 text-white',
};

const emptyForm: CreateTicketPayload = {
  contact: '',
  subject: '',
  description: '',
  priority: 'Media',
  status: 'Abierto',
};

export default function Tickets() {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTicketPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tks, conts] = await Promise.all([
        ticketsApi.getAll({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        }),
        contactsApi.getAll(),
      ]);
      setTickets(tks);
      setContacts(conts);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    const updated = await ticketsApi.update(id, { status });
    setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const handlePriorityChange = async (id: string, priority: TicketPriority) => {
    const updated = await ticketsApi.update(id, { priority });
    setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este ticket?')) return;
    await ticketsApi.delete(id);
    setTickets((prev) => prev.filter((t) => t._id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await ticketsApi.create(form);
      setTickets((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soporte y Tickets</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nuevo Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="select-field w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="select-field w-44"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')}
        >
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* New Ticket Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Ticket</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreate(e)} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cliente / Contacto
                </label>
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Asunto</label>
                <input
                  className="input-field"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  placeholder="Describir brevemente el problema..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Descripción
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Detalle completo del incidente..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Prioridad
                  </label>
                  <select
                    className="select-field"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as TicketPriority })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select
                    className="select-field"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as TicketStatus })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {saving ? 'Creando...' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No se encontraron tickets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Código</th>
                  <th className="table-header">Asunto</th>
                  <th className="table-header hidden md:table-cell">Cliente</th>
                  <th className="table-header">Prioridad</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header hidden lg:table-cell">Creado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {ticket.code}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {ticket.description}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-gray-600">{ticket.contact.fullName}</span>
                    </td>
                    <td className="table-cell">
                      <select
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none ${PRIORITY_STYLES[ticket.priority]}`}
                        value={ticket.priority}
                        onChange={(e) =>
                          void handlePriorityChange(ticket._id, e.target.value as TicketPriority)
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      <select
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-current cursor-pointer focus:outline-none bg-transparent ${STATUS_STYLES[ticket.status]}`}
                        value={ticket.status}
                        onChange={(e) =>
                          void handleStatusChange(ticket._id, e.target.value as TicketStatus)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end">
                        <button
                          onClick={() => void handleDelete(ticket._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
