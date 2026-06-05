import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import OpportunityModal from '../components/OpportunityModal';
import { opportunitiesApi, contactsApi } from '../services/api';
import type { IOpportunity, IContact, CreateOpportunityPayload, PipelineStage } from '../types';

const STAGES: PipelineStage[] = [
  'Prospecto',
  'Calificado',
  'Propuesta',
  'Negociación',
  'Ganado',
  'Perdido',
];

const STAGE_STYLES: Record<PipelineStage, { header: string; dot: string }> = {
  Prospecto: { header: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  Calificado: { header: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  Propuesta: { header: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  Negociación: { header: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  Ganado: { header: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  Perdido: { header: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

export default function Pipeline() {
  const [opportunities, setOpportunities] = useState<IOpportunity[]>([]);
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<IOpportunity | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [opps, conts] = await Promise.all([
        opportunitiesApi.getAll(),
        contactsApi.getAll(),
      ]);
      setOpportunities(opps);
      setContacts(conts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const oppsByStage = (stage: PipelineStage) =>
    opportunities.filter((o) => o.stage === stage);

  const stageTotal = (stage: PipelineStage) =>
    oppsByStage(stage).reduce((sum, o) => sum + o.value, 0);

  const totalPipeline = opportunities.reduce((sum, o) => sum + o.value, 0);

  const handleStageChange = async (id: string, newStage: PipelineStage) => {
    await opportunitiesApi.update(id, { stage: newStage });
    setOpportunities((prev) =>
      prev.map((o) => (o._id === id ? { ...o, stage: newStage } : o))
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta oportunidad?')) return;
    await opportunitiesApi.delete(id);
    setOpportunities((prev) => prev.filter((o) => o._id !== id));
  };

  const handleSave = async (payload: CreateOpportunityPayload) => {
    if (selectedOpp) {
      const updated = await opportunitiesApi.update(selectedOpp._id, payload);
      setOpportunities((prev) =>
        prev.map((o) => (o._id === selectedOpp._id ? updated : o))
      );
    } else {
      const created = await opportunitiesApi.create(payload);
      setOpportunities((prev) => [...prev, created]);
    }
    setSelectedOpp(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {opportunities.length} oportunidades · Valor total:{' '}
            <span className="font-semibold text-gray-700">
              ${totalPipeline.toLocaleString('es-ES')}
            </span>
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setSelectedOpp(null);
            setShowModal(true);
          }}
        >
          <Plus size={16} />
          Nueva Oportunidad
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.map((stage) => {
          const items = oppsByStage(stage);
          const total = stageTotal(stage);
          const styles = STAGE_STYLES[stage];

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-64 flex flex-col bg-gray-50 rounded-xl border border-gray-200"
            >
              {/* Column Header */}
              <div
                className={`px-3 py-2.5 rounded-t-xl flex items-center justify-between ${styles.header}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className="text-xs font-semibold">{stage}</span>
                  <span className="text-xs font-medium opacity-70">({items.length})</span>
                </div>
                <span className="text-xs font-medium">
                  ${(total / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {items.length === 0 && (
                  <div className="py-6 text-center text-gray-400 text-xs">Sin oportunidades</div>
                )}
                {items.map((opp) => (
                  <div
                    key={opp._id}
                    className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <h3
                        className="text-xs font-semibold text-gray-800 leading-tight cursor-pointer hover:text-blue-600 flex-1"
                        onClick={() => {
                          setSelectedOpp(opp);
                          setShowModal(true);
                        }}
                      >
                        {opp.title}
                      </h3>
                      <button
                        onClick={() => void handleDelete(opp._id)}
                        className="shrink-0 p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={11} />
                        <span className="truncate">{opp.contact.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <DollarSign size={11} />
                        <span className="font-semibold text-gray-700">
                          {opp.value.toLocaleString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={11} />
                        <span>
                          {new Date(opp.closingDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Stage Selector */}
                    <select
                      className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={opp.stage}
                      onChange={(e) =>
                        void handleStageChange(opp._id, e.target.value as PipelineStage)
                      }
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <OpportunityModal
          opportunity={selectedOpp}
          contacts={contacts}
          onClose={() => {
            setShowModal(false);
            setSelectedOpp(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
