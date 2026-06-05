import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import contactRoutes from './routes/contacts';
import opportunityRoutes from './routes/opportunities';
import ticketRoutes from './routes/tickets';
import campaignRoutes from './routes/campaigns';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 8080;

connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/contacts', contactRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
