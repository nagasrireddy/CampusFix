// ---------------------------------------------------------
// pages/student/TicketTimeline.jsx
// Detailed single-ticket view for a student, rendering the
// full statusTimeline as a vertical stepper so they can see
// exactly when the ticket moved between each stage.
// ---------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axiosInstance';

const STAGES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const TicketTimeline = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data.ticket);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const currentStageIndex = ticket ? STAGES.indexOf(ticket.status) : -1;

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/student" className="mb-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back to my tickets
        </Link>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading ticket details...</p>}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {ticket && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {ticket.location.labName} · Row {ticket.location.rowNumber} · PC {ticket.location.pcNumber}
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{ticket.issueDescription}</h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>

              {ticket.mediaUrl && (
                <div className="mt-4">
                  {ticket.mediaType === 'video' ? (
                    <video src={ticket.mediaUrl} controls className="max-h-80 w-full rounded-lg border border-surface-lightBorder dark:border-ink-600" />
                  ) : (
                    <img src={ticket.mediaUrl} alt="Proof of issue" className="max-h-80 w-full rounded-lg border border-surface-lightBorder object-cover dark:border-ink-600" />
                  )}
                </div>
              )}

              {ticket.technicianId && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  Assigned technician: <span className="font-semibold">{ticket.technicianId.name}</span> ({ticket.technicianId.specialization})
                </p>
              )}

              {ticket.resolutionNotes && (
                <div className="mt-4 rounded-lg bg-status-resolved/10 p-3 text-sm text-slate-700 dark:text-slate-200">
                  <p className="font-semibold text-status-resolved">Resolution Notes</p>
                  <p>{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>

            {/* Vertical status stepper - solid backgrounds, no transparency */}
            <div className="card p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status Timeline
              </h2>
              <ol className="space-y-0">
                {STAGES.map((stage, idx) => {
                  const isComplete = idx <= currentStageIndex;
                  const timelineEntry = ticket.statusTimeline.find((t) => t.status === stage);
                  return (
                    <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
                      {idx !== STAGES.length - 1 && (
                        <span
                          className={`absolute left-[15px] top-8 h-full w-0.5 ${
                            isComplete ? 'bg-brand-600' : 'bg-surface-lightBorder dark:bg-ink-600'
                          }`}
                        />
                      )}
                      <span
                        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                          isComplete ? 'bg-brand-600' : 'bg-slate-300 dark:bg-ink-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${isComplete ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                          {stage}
                        </p>
                        {timelineEntry && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(timelineEntry.updatedAt)}</p>
                        )}
                        {timelineEntry?.note && (
                          <p className="mt-0.5 text-xs italic text-slate-500 dark:text-slate-400">"{timelineEntry.note}"</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketTimeline;
