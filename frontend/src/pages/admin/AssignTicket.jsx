// ---------------------------------------------------------
// pages/admin/AssignTicket.jsx
// Admin-only ticket detail + triage view. This is the ONLY
// screen in the app that can call PATCH /tickets/:id/assign
// (which mutates technicianId), enforced both here (UI hides
// the control from non-admins) and on the backend (route-level
// authorizeRoles('admin')).
// ---------------------------------------------------------

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axiosInstance';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const AssignTicket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Low');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketRes, techRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get('/users/technicians'),
      ]);
      setTicket(ticketRes.data.ticket);
      setSelectedPriority(ticketRes.data.ticket.priority);
      setSelectedTechnician(ticketRes.data.ticket.technicianId?._id || '');
      setTechnicians(techRes.data.technicians.filter((t) => t.isActive));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load ticket details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!selectedTechnician) {
      setActionError('Please select a technician to assign');
      return;
    }
    setAssigning(true);
    try {
      const { data } = await api.patch(`/tickets/${id}/assign`, {
        technicianId: selectedTechnician,
        priority: selectedPriority,
      });
      setTicket(data.ticket);
      setActionSuccess(data.message);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  const handlePriorityOnlyUpdate = async (priority) => {
    setActionError('');
    setActionSuccess('');
    try {
      const { data } = await api.patch(`/tickets/${id}/priority`, { priority });
      setTicket(data.ticket);
      setSelectedPriority(priority);
      setActionSuccess('Priority updated');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not update priority');
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/admin" className="mb-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back to all tickets
        </Link>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading ticket...</p>}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
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
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reported by {ticket.studentId.name} ({ticket.studentId.email})</p>
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
            </div>

            <div className="card p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Triage &amp; Assignment
              </h2>

              {actionError && (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{actionError}</div>
              )}
              {actionSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">{actionSuccess}</div>
              )}

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    className="form-input"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {ticket.technicianId && (
                    <button
                      type="button"
                      onClick={() => handlePriorityOnlyUpdate(selectedPriority)}
                      className="btn-secondary mt-2 !py-1.5 text-xs"
                    >
                      Update Priority Only
                    </button>
                  )}
                </div>

                <div>
                  <label className="form-label" htmlFor="technician">Assign Technician</label>
                  <select
                    id="technician"
                    className="form-input"
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                  >
                    <option value="">Select a technician</option>
                    {technicians.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} — {t.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={assigning} className="btn-primary w-full">
                  {assigning ? 'Assigning...' : ticket.technicianId ? 'Reassign Ticket' : 'Assign Ticket'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignTicket;
