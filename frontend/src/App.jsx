// ---------------------------------------------------------
// App.jsx
// Central route table. Each portal's routes are nested behind
// a ProtectedRoute restricted to its role, so a student can
// never even mount the AdminDashboard component tree.
// ---------------------------------------------------------

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import NewTicket from './pages/student/NewTicket';
import TicketTimeline from './pages/student/TicketTimeline';

import AdminDashboard from './pages/admin/AdminDashboard';
import AssignTicket from './pages/admin/AssignTicket';

import TechnicianQueue from './pages/technician/TechnicianQueue';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---- Student Portal ---- */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/new"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <NewTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <TicketTimeline />
          </ProtectedRoute>
        }
      />

      {/* ---- Admin Portal ---- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AssignTicket />
          </ProtectedRoute>
        }
      />

      {/* ---- Technician Portal ---- */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={['technician']}>
            <TechnicianQueue />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
