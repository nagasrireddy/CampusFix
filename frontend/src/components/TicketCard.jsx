// ---------------------------------------------------------
// components/TicketCard.jsx
// Compact, information-dense ticket summary used in list views
// across all three portals. Fully responsive - stacks cleanly
// on narrow (mobile technician) screens.
// ---------------------------------------------------------

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const TicketCard = ({ ticket, linkTo, footer }) => {
  const content = (
    <div className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {ticket.location?.labName} · Row {ticket.location?.rowNumber} · PC {ticket.location?.pcNumber}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            {ticket.issueDescription}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-lightBorder pt-3 text-xs text-slate-500 dark:border-ink-600 dark:text-slate-400">
        <span>Reported by {ticket.studentId?.name || 'Unknown student'}</span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>

      {ticket.technicianId && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Assigned to <span className="font-semibold text-slate-700 dark:text-slate-200">{ticket.technicianId.name}</span>{' '}
          ({ticket.technicianId.specialization})
        </p>
      )}

      {footer}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }
  return content;
};

export default TicketCard;
