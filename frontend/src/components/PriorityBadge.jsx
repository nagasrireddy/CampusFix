// ---------------------------------------------------------
// components/PriorityBadge.jsx
// Renders a ticket's triage priority as a solid-colored pill.
// ---------------------------------------------------------

import React from 'react';

const PRIORITY_STYLES = {
  Low: 'bg-priority-low',
  Medium: 'bg-priority-medium',
  High: 'bg-priority-high',
};

const PriorityBadge = ({ priority }) => {
  const colorClass = PRIORITY_STYLES[priority] || 'bg-slate-500';
  return <span className={`badge ${colorClass}`}>{priority} Priority</span>;
};

export default PriorityBadge;
