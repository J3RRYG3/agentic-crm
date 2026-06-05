import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, MessageSquare, Eye } from 'lucide-react';
import ContactModal from '../components/ContactModal';
import { contactsApi } from '../services/api';
import type {
  IContact,
  CreateContactPayload,
  LeadStatus,
} from '../types';

const LEAD_STATUSES: LeadStatus[] = ['Nuevo', 'Contactado', 'Cualificado', 'Inactivo'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  Nuevo: 'bg-blue-100 text-blue-700',
  Contactado: 'bg-yellow-100 text-yellow-700',
  Cualificado: 'bg-green-100 text-green-700',
  Inactivo: 'bg-gray-100 text-gray-600',
};

type ModalMode = 'view' | 'edit' | 'create';

export default function Contacts() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactsApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const openModal = (mode: ModalMode, contact: IContact | null = null) => {
    setModalMode(mode);
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleSave = async (payload: CreateContactPayload) => {
    if (modalMode === 'create') {
      await contactsApi.create(payload);
    } else if (selectedContact) {
      await contactsApi.update(selectedContact._id, payload);
    }
    await load();
  };

  const handleAddNote = async (contactId: string, text: string) => {
    const updated = await contactsApi.addNote(contactId, text);
    setSelectedContact(updated);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este contacto?')) return;
    await contactsApi.delete(id);
    await load();
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contacts.length} contacto{contacts.length !== 1 ? 's' : ''} encontrado{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openModal('create')}>
          <Plus size={16} />
          Nuevo Contacto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input-field pl-9"
            placeholder="Buscar por nombre, email, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
        >
          <option value="">Todos los estados</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando contactos...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No se encontraron contactos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Nombre</th>
                  <th className="table-header">Email</th>
                  <th className="table-header hidden md:table-cell">Empresa</th>
                  <th className="table-header hidden lg:table-cell">Cargo</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header hidden sm:table-cell">Notas</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900">
                      {contact.fullName}
                    </td>
                    <td className="table-cell text-gray-500">{contact.email}</td>
                    <td className="table-cell hidden md:table-cell">{contact.company}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-500">
                      {contact.position}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLORS[contact.leadStatus]}`}>
                        {contact.leadStatus}
                      </span>
                    </td>
                    <td className="table-cell hidden sm:table-cell text-gray-500">
                      {contact.notes.length}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Ver detalles"
                          onClick={() => openModal('view', contact)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Ver notas"
                          onClick={() => {
                            openModal('view', contact);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <MessageSquare size={15} />
                        </button>
                        <button
                          title="Editar"
                          onClick={() => openModal('edit', contact)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => void handleDelete(contact._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

      {/* Modal */}
      {showModal && (
        <ContactModal
          contact={selectedContact}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
