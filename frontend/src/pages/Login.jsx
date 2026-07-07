// ---------------------------------------------------------
// pages/Login.jsx
// Shared login screen for all three roles. After a successful
// login, the user is routed to the dashboard matching the role
// returned by the backend (never a role selected client-side,
// preventing any client-controlled privilege escalation).
// ---------------------------------------------------------

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const user = await login(formData.email, formData.password);
      const redirectTo = location.state?.from?.pathname || `/${user.role}`;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            CF
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back to CampusFix</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to report, manage, or resolve campus tickets.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              {serverError}
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@college.edu"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
