import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  TicketCheck,
  Megaphone,
  Building2,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contactos', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/tickets', label: 'Soporte', icon: TicketCheck },
  { to: '/campaigns', label: 'Campañas', icon: Megaphone },
];

export default function Navbar() {
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Mini-CRM</p>
            <p className="text-xs text-gray-400">v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          MERN Stack · TypeScript
        </p>
      </div>
    </aside>
  );
}
