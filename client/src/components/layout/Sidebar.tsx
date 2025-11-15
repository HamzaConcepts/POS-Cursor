import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon?: string;
  roles?: ('Manager' | 'Admin' | 'Cashier')[];
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', roles: ['Manager', 'Admin', 'Cashier'] },
  { path: '/pos', label: 'POS', roles: ['Manager', 'Admin', 'Cashier'] },
  { path: '/inventory', label: 'Inventory', roles: ['Manager', 'Admin'] },
  { path: '/sales', label: 'Sales', roles: ['Manager', 'Admin', 'Cashier'] },
  { path: '/accounting', label: 'Accounting', roles: ['Manager', 'Admin'] },
  { path: '/reports', label: 'Reports', roles: ['Manager', 'Admin'] },
  { path: '/users', label: 'Users', roles: ['Manager'] },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="w-64 bg-white border-r border-border-light h-screen flex flex-col">
      {/* Logo/App Name */}
      <div className="p-6 border-b border-border-light">
        <h1 className="text-2xl font-bold text-text-primary">Hectagon POS System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-border-light">
          <div className="mb-3">
            <p className="text-sm font-semibold text-text-primary">{user.full_name}</p>
            <p className="text-xs text-text-secondary">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

