// ---------------------------------------------------------
// pages/technician/TechnicianQueue.jsx
// Mobile-first work queue for technicians. Cards stack in a
// single column by default and expand to a grid on larger
// viewports. Each card exposes inline actions to move a ticket
// to "In Progress" or "Resolved" - the only two transitions a
// technician is authorized to make (enforced server-side too).
// ---------------------------------------------------------

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axiosInstance';

const TechnicianQueue = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionTicketId, setActionTicketId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tickets/queue');
      setTickets(data.tickets);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const updateStatus = async (ticketId, status, note = '') => {
    setUpdatingId(ticketId);
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status, note });
      setActionTicketId(null);
      setResolutionNote('');
      await fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update ticket status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-1 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">My Work Queue</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Tickets assigned to you, sorted by priority.</p>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading your queue...</p>}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
        )}
        {!loading && !error && tickets.length === 0 && (
          <div className="card p-8 text-center text-slate-500 dark:text-slate-400">Your queue is empty. Nice work!</div>
        )}

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {ticket.location.labName} · Row {ticket.location.rowNumber} · PC {ticket.location.pcNumber}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{ticket.issueDescription}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>

              {ticket.mediaUrl && (
                <div className="mt-3">
                  {ticket.mediaType === 'video' ? (
                    <video src={ticket.mediaUrl} controls className="max-h-56 w-full rounded-lg border border-surface-lightBorder dark:border-ink-600" />
                  ) : (
                    <img src={ticket.mediaUrl} alt="Proof of issue" className="max-h-56 w-full rounded-lg border border-surface-lightBorder object-cover dark:border-ink-600" />
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Reported by {ticket.studentId.name} · {ticket.studentId.email}
              </p>

              {/* Action row - stacks full-width on mobile, inline on larger screens */}
              <div className="mt-4 flex flex-col gap-2 border-t border-surface-lightBorder pt-4 dark:border-ink-600 sm:flex-row">
                {ticket.status === 'Assigned' && (
                  <button
                    onClick={() => updateStatus(ticket._id, 'In Progress')}
                    disabled={updatingId === ticket._id}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    {updatingId === ticket._id ? 'Updating...' : 'Start Work'}
                  </button>
                )}

                {ticket.status === 'In Progress' && actionTicketId !== ticket._id && (
                  <button onClick={() => setActionTicketId(ticket._id)} className="btn-primary w-full sm:w-auto">
                    Mark Resolved
                  </button>
                )}

                {ticket.status === 'In Progress' && actionTicketId === ticket._id && (
                  <div className="w-full space-y-2">
                    <textarea
                      className="form-input resize-none"
                      rows={2}
                      placeholder="Add resolution notes (optional)"
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(ticket._id, 'Resolved', resolutionNote)}
                        disabled={updatingId === ticket._id}
                        className="btn-primary flex-1"
                      >
                        {updatingId === ticket._id ? 'Saving...' : 'Confirm Resolved'}
                      </button>
                      <button onClick={() => setActionTicketId(null)} className="btn-secondary flex-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TechnicianQueue;
