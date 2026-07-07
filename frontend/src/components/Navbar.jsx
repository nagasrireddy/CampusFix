// ---------------------------------------------------------
// components/Navbar.jsx
// Shared top navigation bar. Displays role-aware branding and
// a logout control. Uses a solid, opaque background (no blur,
// no transparency) per the design constraint.
// ---------------------------------------------------------

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  student: 'Student Portal',
  admin: 'Admin Console',
  technician: 'Technician Queue',
};

const ROLE_ACCENTS = {
  student: 'bg-brand-600',
  admin: 'bg-slate-900 dark:bg-slate-700',
  technician: 'bg-amber-600',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-surface-lightBorder bg-surface-light dark:border-ink-600 dark:bg-ink-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white ${ROLE_ACCENTS[user?.role] || 'bg-brand-600'}`}>
            CF
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900 dark:text-white">CampusFix</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user?.role] || 'Dashboard'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary !px-3 !py-2 text-xs">
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
