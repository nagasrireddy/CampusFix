// ---------------------------------------------------------
// components/StatusBadge.jsx
// Renders a ticket's status as a solid-colored pill. Colors
// map 1:1 to the Ticket.status enum on the backend.
// ---------------------------------------------------------

import React from 'react';

const STATUS_STYLES = {
  Submitted: 'bg-status-submitted',
  Assigned: 'bg-status-assigned',
  'In Progress': 'bg-status-progress',
  Resolved: 'bg-status-resolved',
};

const StatusBadge = ({ status }) => {
  const colorClass = STATUS_STYLES[status] || 'bg-slate-500';
  return <span className={`badge ${colorClass}`}>{status}</span>;
};

export default StatusBadge;
