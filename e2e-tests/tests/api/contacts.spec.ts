import { test, expect } from '@playwright/test';

// ── Tipos de dominio ──────────────────────────────────────────────────────────
type LeadStatus = 'Nuevo' | 'Contactado' | 'Cualificado' | 'Inactivo';

interface ContactNote {
  text: string;
  date: string;
}

interface ContactResponse {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  leadStatus: LeadStatus;
  notes: ContactNote[];
  createdAt: string;
  updatedAt: string;
}

interface DeleteResponse {
  message: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const API = 'http://localhost:8080';
const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}@playwright-qa.test`;

// ─────────────────────────────────────────────────────────────────────────────
// Caso de Test 1: POST /api/contacts
// Valida persistencia estricta de un Lead nuevo en MongoDB
// ─────────────────────────────────────────────────────────────────────────────
test.describe('API – M1 Contactos', () => {
  test('POST /api/contacts — crea y persiste un Lead nuevo', async ({ request }) => {
    const email = uniqueEmail('lead.test');
    let createdId = '';

    try {
      // ── 1. Crear contacto ──
      const createResp = await request.post(`${API}/api/contacts`, {
        data: {
          fullName: 'Lead QA Playwright',
          email,
          phone: '+34 600 111 222',
          company: 'QA Corp SL',
          position: 'QA Engineer',
          leadStatus: 'Nuevo',
        },
      });

      expect(createResp.status()).toBe(201);
      const created = (await createResp.json()) as ContactResponse;

      // ── 2. Verificar estructura del payload ──
      expect(created._id).toBeTruthy();
      expect(created.fullName).toBe('Lead QA Playwright');
      expect(created.email).toBe(email.toLowerCase());
      expect(created.leadStatus).toBe('Nuevo');
      expect(Array.isArray(created.notes)).toBe(true);
      expect(created.notes).toHaveLength(0);

      createdId = created._id;

      // ── 3. Verificar persistencia en BD con GET individual ──
      const getResp = await request.get(`${API}/api/contacts/${createdId}`);
      expect(getResp.status()).toBe(200);
      const fetched = (await getResp.json()) as ContactResponse;
      expect(fetched.fullName).toBe('Lead QA Playwright');
      expect(fetched.email).toBe(email.toLowerCase());

      // ── 4. Verificar aparición en listado ──
      const listResp = await request.get(`${API}/api/contacts?search=QA Playwright`);
      expect(listResp.status()).toBe(200);
      const list = (await listResp.json()) as ContactResponse[];
      expect(list.some((c) => c._id === createdId)).toBe(true);
    } finally {
      // ── Cleanup: eliminar contacto de prueba ──
      if (createdId) {
        const delResp = await request.delete(`${API}/api/contacts/${createdId}`);
        const delBody = (await delResp.json()) as DeleteResponse;
        expect(delBody.message).toContain('eliminado');
      }
    }
  });

  test('POST /api/contacts/:id/notes — agrega nota histórica al Lead', async ({ request }) => {
    const email = uniqueEmail('note.test');
    let createdId = '';

    try {
      // Crear contacto auxiliar
      const createResp = await request.post(`${API}/api/contacts`, {
        data: {
          fullName: 'Contacto Notas QA',
          email,
          phone: '+34 611 222 333',
          company: 'Notes Corp',
          position: 'Tester',
          leadStatus: 'Contactado',
        },
      });
      expect(createResp.status()).toBe(201);
      const contact = (await createResp.json()) as ContactResponse;
      createdId = contact._id;

      // Agregar nota
      const noteText = 'Primera nota de prueba automatizada — Playwright QA';
      const noteResp = await request.post(`${API}/api/contacts/${createdId}/notes`, {
        data: { text: noteText },
      });
      expect(noteResp.status()).toBe(200);
      const updated = (await noteResp.json()) as ContactResponse;
      expect(updated.notes).toHaveLength(1);
      expect(updated.notes[0].text).toBe(noteText);
      expect(updated.notes[0].date).toBeTruthy();

      // Verificar persistencia de nota con GET
      const getResp = await request.get(`${API}/api/contacts/${createdId}`);
      const refetched = (await getResp.json()) as ContactResponse;
      expect(refetched.notes).toHaveLength(1);
      expect(refetched.notes[0].text).toBe(noteText);
    } finally {
      if (createdId) {
        await request.delete(`${API}/api/contacts/${createdId}`);
      }
    }
  });

  test('PUT /api/contacts/:id — actualiza estado de Lead correctamente', async ({ request }) => {
    const email = uniqueEmail('update.test');
    let createdId = '';

    try {
      const createResp = await request.post(`${API}/api/contacts`, {
        data: {
          fullName: 'Contacto Update QA',
          email,
          phone: '+34 622 333 444',
          company: 'Update Corp',
          position: 'Dev',
          leadStatus: 'Nuevo',
        },
      });
      const contact = (await createResp.json()) as ContactResponse;
      createdId = contact._id;

      // Actualizar a 'Cualificado'
      const updateResp = await request.put(`${API}/api/contacts/${createdId}`, {
        data: { leadStatus: 'Cualificado' },
      });
      expect(updateResp.status()).toBe(200);
      const updated = (await updateResp.json()) as ContactResponse;
      expect(updated.leadStatus).toBe('Cualificado');
    } finally {
      if (createdId) {
        await request.delete(`${API}/api/contacts/${createdId}`);
      }
    }
  });
});
