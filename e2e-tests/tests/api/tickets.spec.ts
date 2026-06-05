import { test, expect } from '@playwright/test';

// ── Tipos de dominio ──────────────────────────────────────────────────────────
type TicketStatus = 'Abierto' | 'En Progreso' | 'Resuelto';
type TicketPriority = 'Baja' | 'Media' | 'Alta';

interface TicketContact {
  _id: string;
  fullName: string;
}

interface TicketResponse {
  _id: string;
  code: string;
  contact: TicketContact;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Caso de Test 2: PUT /api/tickets/:id
// Valida mutación e incremento de estados de soporte
// ─────────────────────────────────────────────────────────────────────────────
const API = 'http://localhost:8080';

test.describe('API – M3 Tickets', () => {
  test('PUT /api/tickets/:id — muta estado de Abierto a En Progreso', async ({ request }) => {
    // Obtener un ticket con status 'Abierto' del seed
    const listResp = await request.get(`${API}/api/tickets?status=Abierto`);
    expect(listResp.status()).toBe(200);
    const tickets = (await listResp.json()) as TicketResponse[];
    expect(tickets.length).toBeGreaterThan(0);

    const target = tickets[0];
    const originalStatus: TicketStatus = target.status;
    expect(originalStatus).toBe('Abierto');

    // Mutar a 'En Progreso'
    const updateResp = await request.put(`${API}/api/tickets/${target._id}`, {
      data: { status: 'En Progreso' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = (await updateResp.json()) as TicketResponse;
    expect(updated.status).toBe('En Progreso');
    expect(updated._id).toBe(target._id);

    // Verificar persistencia con GET individual
    const getResp = await request.get(`${API}/api/tickets/${target._id}`);
    expect(getResp.status()).toBe(200);
    const persisted = (await getResp.json()) as TicketResponse;
    expect(persisted.status).toBe('En Progreso');

    // Restaurar estado original para no contaminar otros tests
    await request.put(`${API}/api/tickets/${target._id}`, {
      data: { status: originalStatus },
    });
  });

  test('PUT /api/tickets/:id — muta prioridad de Media a Alta', async ({ request }) => {
    const listResp = await request.get(`${API}/api/tickets`);
    const tickets = (await listResp.json()) as TicketResponse[];
    const mediaTicket = tickets.find((t) => t.priority === 'Media');
    expect(mediaTicket).toBeTruthy();

    if (!mediaTicket) return;

    const updateResp = await request.put(`${API}/api/tickets/${mediaTicket._id}`, {
      data: { priority: 'Alta' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = (await updateResp.json()) as TicketResponse;
    expect(updated.priority).toBe('Alta');

    // Restaurar
    await request.put(`${API}/api/tickets/${mediaTicket._id}`, {
      data: { priority: 'Media' },
    });
  });

  test('GET /api/tickets — devuelve código TKT-XXXXX para cada ticket', async ({ request }) => {
    const listResp = await request.get(`${API}/api/tickets`);
    expect(listResp.status()).toBe(200);
    const tickets = (await listResp.json()) as TicketResponse[];
    expect(tickets.length).toBeGreaterThan(0);

    for (const ticket of tickets) {
      // Validar formato TKT-XXXXX
      expect(ticket.code).toMatch(/^TKT-\d{5}$/);
    }
  });

  test('GET /api/tickets?status= — filtra tickets por estado correctamente', async ({ request }) => {
    const statuses: TicketStatus[] = ['Abierto', 'En Progreso', 'Resuelto'];

    for (const status of statuses) {
      const resp = await request.get(`${API}/api/tickets?status=${encodeURIComponent(status)}`);
      expect(resp.status()).toBe(200);
      const filtered = (await resp.json()) as TicketResponse[];
      for (const t of filtered) {
        expect(t.status).toBe(status);
      }
    }
  });
});
