import { test, expect } from '@playwright/test';

// ── Tipos de dominio ──────────────────────────────────────────────────────────
type LeadStatus = 'Nuevo' | 'Contactado' | 'Cualificado' | 'Inactivo';
type CampaignStatus = 'Borrador' | 'Enviada';

interface CampaignResponse {
  _id: string;
  name: string;
  targetSegment: LeadStatus[];
  emailSubject: string;
  emailBody: string;
  status: CampaignStatus;
  sentAt?: string;
  affectedContacts: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactNote {
  text: string;
  date: string;
}

interface ContactResponse {
  _id: string;
  fullName: string;
  leadStatus: LeadStatus;
  notes: ContactNote[];
}

interface SendCampaignResponse {
  message: string;
  campaign: CampaignResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// Caso de Test 3: POST /api/campaigns/:id/send
// Valida procesamiento lógico transaccional de Marketing
// ─────────────────────────────────────────────────────────────────────────────
const API = 'http://localhost:8080';

test.describe('API – M4 Campañas', () => {
  test('POST /api/campaigns/:id/send — ejecuta envío masivo y verifica impacto relacional', async ({
    request,
  }) => {
    const campaignName = `Campaña QA Test ${Date.now()}`;
    let campaignId = '';

    try {
      // ── 1. Crear campaña en borrador dirigida a 'Inactivo' ──
      const createResp = await request.post(`${API}/api/campaigns`, {
        data: {
          name: campaignName,
          targetSegment: ['Inactivo'],
          emailSubject: 'QA Test - Asunto de prueba',
          emailBody: 'Cuerpo de la campaña de prueba generada por Playwright QA.',
        },
      });
      expect(createResp.status()).toBe(201);
      const campaign = (await createResp.json()) as CampaignResponse;
      expect(campaign.status).toBe('Borrador');
      expect(campaign.affectedContacts).toBe(0);
      campaignId = campaign._id;

      // ── 2. Obtener contactos del segmento antes del envío ──
      const contactsBefore = await request.get(`${API}/api/contacts?status=Inactivo`);
      const segmentContacts = (await contactsBefore.json()) as ContactResponse[];
      expect(segmentContacts.length).toBeGreaterThan(0);
      const noteCountsBefore = segmentContacts.map((c) => c.notes.length);

      // ── 3. Enviar la campaña ──
      const sendResp = await request.post(`${API}/api/campaigns/${campaignId}/send`);
      expect(sendResp.status()).toBe(200);
      const sendResult = (await sendResp.json()) as SendCampaignResponse;

      // ── 4. Verificar estado de la campaña tras envío ──
      expect(sendResult.campaign.status).toBe('Enviada');
      expect(sendResult.campaign.sentAt).toBeTruthy();
      expect(sendResult.campaign.affectedContacts).toBe(segmentContacts.length);
      expect(sendResult.message).toContain(`${segmentContacts.length} contactos`);

      // ── 5. Verificar impacto relacional: nota insertada en cada contacto ──
      const contactsAfter = await request.get(`${API}/api/contacts?status=Inactivo`);
      const updatedContacts = (await contactsAfter.json()) as ContactResponse[];
      for (let i = 0; i < updatedContacts.length; i++) {
        const before = noteCountsBefore[i] ?? 0;
        expect(updatedContacts[i].notes.length).toBeGreaterThan(before);
        const lastNote = updatedContacts[i].notes[updatedContacts[i].notes.length - 1];
        expect(lastNote.text).toContain(campaignName);
      }

      // ── 6. Verificar que re-envío está bloqueado ──
      const resendResp = await request.post(`${API}/api/campaigns/${campaignId}/send`);
      expect(resendResp.status()).toBe(400);
    } finally {
      // Cleanup campaña
      if (campaignId) {
        await request.delete(`${API}/api/campaigns/${campaignId}`);
      }
    }
  });

  test('GET /api/campaigns — lista campañas con estructura correcta', async ({ request }) => {
    const resp = await request.get(`${API}/api/campaigns`);
    expect(resp.status()).toBe(200);
    const campaigns = (await resp.json()) as CampaignResponse[];
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBeGreaterThan(0);

    for (const c of campaigns) {
      expect(c._id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(Array.isArray(c.targetSegment)).toBe(true);
      expect(['Borrador', 'Enviada']).toContain(c.status);
    }
  });
});
