// ---------------------------------------------------------
// pages/admin/AdminDashboard.jsx
// Admin control center: KPI metrics strip + filterable ticket
// list across the entire campus. Clicking a ticket opens the
// AssignTicket detail view where triage actions happen.
// ---------------------------------------------------------

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import TicketCard from '../../components/TicketCard';
import MetricCard from '../../components/MetricCard';
import api from '../../api/axiosInstance';

const STATUS_FILTERS = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved'];
const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High'];

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const [ticketsRes, statsRes] = await Promise.all([
        api.get('/tickets', { params }),
        api.get('/tickets/stats'),
      ]);
      setTickets(ticketsRes.data.tickets);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">Admin Console</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Triage, assign, and monitor every ticket across campus.</p>

        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Total Tickets" value={stats.total} accentClass="bg-slate-700" />
            <MetricCard label="Submitted" value={stats.byStatus.Submitted} accentClass="bg-status-submitted" />
            <MetricCard label="In Progress" value={stats.byStatus['In Progress']} accentClass="bg-status-progress" />
            <MetricCard label="Resolved" value={stats.byStatus.Resolved} accentClass="bg-status-resolved" />
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <p className="form-label">Filter by Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-lightMuted text-slate-700 dark:bg-ink-700 dark:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="form-label">Filter by Priority</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_FILTERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    priorityFilter === p
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-lightMuted text-slate-700 dark:bg-ink-700 dark:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading tickets...</p>}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        {!loading && !error && tickets.length === 0 && (
          <div className="card p-10 text-center text-slate-500 dark:text-slate-400">No tickets match the current filters.</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} linkTo={`/admin/tickets/${ticket._id}`} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
