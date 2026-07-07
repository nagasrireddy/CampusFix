// ---------------------------------------------------------
// components/MetricCard.jsx
// Solid-background KPI tile for the admin metrics dashboard.
// ---------------------------------------------------------

import React from 'react';

const MetricCard = ({ label, value, accentClass = 'bg-brand-600' }) => (
  <div className="card flex items-center gap-4 p-5">
    <span className={`h-11 w-2 rounded-full ${accentClass}`} aria-hidden="true" />
    <div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

export default MetricCard;
