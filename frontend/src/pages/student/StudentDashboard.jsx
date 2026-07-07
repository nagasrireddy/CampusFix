// ---------------------------------------------------------
// pages/student/StudentDashboard.jsx
// Student landing page: lists all tickets they have personally
// submitted, newest first, with a shortcut to file a new one.
// ---------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TicketCard from '../../components/TicketCard';
import api from '../../api/axiosInstance';

const StudentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets/my');
        setTickets(data.tickets);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Reported Issues</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track the status of every ticket you've submitted.</p>
          </div>
          <Link to="/student/new" className="btn-primary">
            + Report New Issue
          </Link>
        </div>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading your tickets...</p>}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">You haven't reported any issues yet.</p>
            <Link to="/student/new" className="btn-primary mt-4 inline-flex">
              Report Your First Issue
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} linkTo={`/student/tickets/${ticket._id}`} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
