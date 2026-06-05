import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Tickets from './pages/Tickets';
import Campaigns from './pages/Campaigns';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/campaigns" element={<Campaigns />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
