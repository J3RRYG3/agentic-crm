import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Contact from './models/Contact';
import Opportunity from './models/Opportunity';
import Ticket from './models/Ticket';
import Campaign from './models/Campaign';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/minicrm';

const seed = async (): Promise<void> => {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB para seed...');

  console.log('Limpiando colecciones existentes...');
  await Promise.all([
    Contact.deleteMany({}),
    Opportunity.deleteMany({}),
    Ticket.deleteMany({}),
    Campaign.deleteMany({}),
  ]);

  console.log('Insertando contactos...');
  const contacts = await Contact.insertMany([
    {
      fullName: 'Ana García López',
      email: 'ana.garcia@techcorp.com',
      phone: '+34 612 345 678',
      company: 'TechCorp S.L.',
      position: 'Directora de Marketing',
      leadStatus: 'Cualificado',
      notes: [
        { text: 'Primera llamada muy positiva, interesada en nuestros servicios de nube.', date: new Date('2024-03-15') },
        { text: 'Envió solicitud de propuesta por email.', date: new Date('2024-03-20') },
      ],
    },
    {
      fullName: 'Carlos Méndez Ruiz',
      email: 'carlos.mendez@innovatech.es',
      phone: '+34 699 876 543',
      company: 'InnovaTech S.A.',
      position: 'CEO',
      leadStatus: 'Contactado',
      notes: [
        { text: 'Contactado vía LinkedIn. Mostraron interés inicial.', date: new Date('2024-04-01') },
      ],
    },
    {
      fullName: 'Laura Fernández Torres',
      email: 'l.fernandez@digitalwave.com',
      phone: '+34 677 234 987',
      company: 'DigitalWave',
      position: 'CTO',
      leadStatus: 'Nuevo',
      notes: [],
    },
    {
      fullName: 'Miguel Ángel Soto',
      email: 'miguel.soto@gruposolana.net',
      phone: '+34 654 321 098',
      company: 'Grupo Solana',
      position: 'Director Comercial',
      leadStatus: 'Cualificado',
      notes: [
        { text: 'Reunión presencial en Madrid. Muy interesado en módulo de automatización.', date: new Date('2024-04-10') },
      ],
    },
    {
      fullName: 'Patricia Vázquez Gil',
      email: 'p.vazquez@nexusgroup.es',
      phone: '+34 623 456 789',
      company: 'Nexus Group',
      position: 'Responsable de TI',
      leadStatus: 'Inactivo',
      notes: [
        { text: 'No respondió a los últimos 3 correos. Pasar a inactivo.', date: new Date('2024-02-28') },
      ],
    },
    {
      fullName: 'Roberto Jiménez Alba',
      email: 'r.jimenez@consultia.com',
      phone: '+34 688 765 432',
      company: 'Consultia & Partners',
      position: 'Socio Fundador',
      leadStatus: 'Contactado',
      notes: [],
    },
    {
      fullName: 'Sofía Morales Blanco',
      email: 'sofia.morales@datadriven.io',
      phone: '+34 671 098 765',
      company: 'DataDriven IO',
      position: 'Head of Sales',
      leadStatus: 'Cualificado',
      notes: [
        { text: 'Demo técnica realizada con éxito. Equipo muy entusiasta.', date: new Date('2024-04-15') },
        { text: 'Solicita contrato para revisión legal.', date: new Date('2024-04-18') },
      ],
    },
    {
      fullName: 'Andrés López Castillo',
      email: 'a.lopez@greenenergy.es',
      phone: '+34 645 678 901',
      company: 'GreenEnergy Solutions',
      position: 'Gerente de Proyectos',
      leadStatus: 'Nuevo',
      notes: [],
    },
    {
      fullName: 'Elena Ruiz Navarro',
      email: 'elena.ruiz@mktpro.com',
      phone: '+34 619 543 210',
      company: 'MKT Pro Agency',
      position: 'Fundadora',
      leadStatus: 'Contactado',
      notes: [
        { text: 'Conocida en evento sectorial. Necesita solución para gestión de clientes.', date: new Date('2024-04-05') },
      ],
    },
    {
      fullName: 'Javier Torres Peña',
      email: 'j.torres@logisticax.com',
      phone: '+34 635 901 234',
      company: 'LogísticaX',
      position: 'Director de Operaciones',
      leadStatus: 'Cualificado',
      notes: [
        { text: 'Aprobó el presupuesto internamente. A la espera de firma.', date: new Date('2024-04-20') },
      ],
    },
  ]);

  console.log(`${contacts.length} contactos insertados.`);

  console.log('Insertando oportunidades...');
  const opportunities = await Opportunity.insertMany([
    {
      title: 'Contrato Anual Cloud TechCorp',
      contact: contacts[0]._id,
      value: 28500,
      stage: 'Propuesta',
      closingDate: new Date('2024-06-30'),
    },
    {
      title: 'Licencias Software InnovaTech',
      contact: contacts[1]._id,
      value: 12000,
      stage: 'Calificado',
      closingDate: new Date('2024-07-15'),
    },
    {
      title: 'Proyecto Transformación Digital Solana',
      contact: contacts[3]._id,
      value: 75000,
      stage: 'Negociación',
      closingDate: new Date('2024-05-31'),
    },
    {
      title: 'Implementación CRM DataDriven',
      contact: contacts[6]._id,
      value: 18900,
      stage: 'Ganado',
      closingDate: new Date('2024-04-30'),
    },
    {
      title: 'Módulo Analítica MKT Pro',
      contact: contacts[8]._id,
      value: 9500,
      stage: 'Prospecto',
      closingDate: new Date('2024-08-01'),
    },
    {
      title: 'Sistema Logístico Integral',
      contact: contacts[9]._id,
      value: 42000,
      stage: 'Propuesta',
      closingDate: new Date('2024-06-15'),
    },
    {
      title: 'Consultoría TI Consultia',
      contact: contacts[5]._id,
      value: 6800,
      stage: 'Perdido',
      closingDate: new Date('2024-03-31'),
    },
    {
      title: 'Plataforma GreenEnergy IoT',
      contact: contacts[7]._id,
      value: 31000,
      stage: 'Calificado',
      closingDate: new Date('2024-07-30'),
    },
  ]);

  console.log(`${opportunities.length} oportunidades insertadas.`);

  console.log('Insertando tickets...');
  // insertMany omite los hooks pre('save'), por lo que 'code' quedaría null.
  // Se guarda uno a uno para que el hook genere TKT-XXXXX correctamente.
  const ticketDocs = [
    { contact: contacts[0]._id, subject: 'Error en módulo de facturación automática', description: 'Al generar facturas recurrentes el sistema duplica los registros cuando hay más de 50 líneas de detalle.', priority: 'Alta' as const, status: 'En Progreso' as const },
    { contact: contacts[3]._id, subject: 'Solicitud de integración con SAP', description: 'Necesitamos documentación y soporte para integrar nuestra instancia de SAP con la API del CRM.', priority: 'Media' as const, status: 'Abierto' as const },
    { contact: contacts[6]._id, subject: 'Panel de analytics no carga datos', description: 'Desde la actualización de ayer, el dashboard de analítica muestra una pantalla en blanco en Safari y Firefox.', priority: 'Alta' as const, status: 'Abierto' as const },
    { contact: contacts[1]._id, subject: 'Configuración de permisos por roles', description: 'Requieren que ciertos usuarios solo puedan ver sus propios registros y no los de otros agentes de venta.', priority: 'Media' as const, status: 'Resuelto' as const },
    { contact: contacts[9]._id, subject: 'Exportación masiva a Excel', description: 'La función de exportar más de 5000 registros falla con timeout. Solo descarga los primeros 500.', priority: 'Alta' as const, status: 'Abierto' as const },
    { contact: contacts[4]._id, subject: 'Consulta sobre renovación de suscripción', description: 'El cliente solicita información sobre los planes de renovación anual y posibles descuentos por volumen.', priority: 'Baja' as const, status: 'Resuelto' as const },
  ];
  const tickets = [];
  for (const doc of ticketDocs) {
    const ticket = new Ticket(doc);
    await ticket.save();
    tickets.push(ticket);
  }

  console.log(`${tickets.length} tickets insertados.`);

  console.log('Insertando campañas...');
  const campaigns = await Campaign.insertMany([
    {
      name: 'Campaña Reactivación Q2 2024',
      targetSegment: ['Inactivo'],
      emailSubject: '¡Te echamos de menos! Descubre las novedades de nuestro CRM',
      emailBody: 'Estimado cliente,\n\nHemos lanzado nuevas funcionalidades que creemos que serán de gran valor para tu equipo...\n\nConfirmamos tu cita con un especialista sin coste.',
      status: 'Enviada',
      sentAt: new Date('2024-04-01'),
      affectedContacts: 1,
    },
    {
      name: 'Upsell Plan Enterprise - Leads Cualificados',
      targetSegment: ['Cualificado'],
      emailSubject: 'Exclusivo para ti: Actualiza al Plan Enterprise con 20% de descuento',
      emailBody: 'Hola,\n\nComo uno de nuestros clientes más valiosos, queremos ofrecerte una propuesta exclusiva para migrar al Plan Enterprise...\n\nOferta válida solo esta semana.',
      status: 'Enviada',
      sentAt: new Date('2024-04-15'),
      affectedContacts: 4,
    },
    {
      name: 'Bienvenida Nuevos Leads - Mayo 2024',
      targetSegment: ['Nuevo', 'Contactado'],
      emailSubject: 'Bienvenido a MiniCRM — Tu guía de inicio rápido',
      emailBody: 'Estimado nuevo cliente,\n\nGracias por confiar en nosotros. Aquí encontrarás todo lo que necesitas para comenzar...\n\n[Enlace a tutorial interactivo]',
      status: 'Borrador',
      affectedContacts: 0,
    },
  ]);

  console.log(`${campaigns.length} campañas insertadas.`);

  console.log('\n✅ Seed completado exitosamente.');
  console.log(`   - ${contacts.length} contactos`);
  console.log(`   - ${opportunities.length} oportunidades`);
  console.log(`   - ${tickets.length} tickets`);
  console.log(`   - ${campaigns.length} campañas`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Error en el script de seed:', err);
  process.exit(1);
});
