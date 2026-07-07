// ---------------------------------------------------------
// pages/Register.jsx
// Registration screen. Role selection is exposed here for demo/
// onboarding convenience (a real campus deployment would likely
// gate admin/technician creation behind an invite-only backend
// flow instead) - the specialization field appears only when
// "technician" is selected, matching the User schema constraint.
// ---------------------------------------------------------

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = ['Network', 'Hardware', 'Software', 'Electrical', 'General'];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'student' } });

  const selectedRole = watch('role');

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const user = await registerUser(formData);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create your CampusFix account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              {serverError}
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" className="form-input" placeholder="Jane Doe" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-input" placeholder="you@college.edu" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" placeholder="At least 8 characters" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="role">I am a...</label>
            <select id="role" className="form-input" {...register('role', { required: true })}>
              <option value="student">Student</option>
              <option value="technician">Technician</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {selectedRole === 'technician' && (
            <div>
              <label className="form-label" htmlFor="specialization">Specialization</label>
              <select id="specialization" className="form-input" {...register('specialization', { required: 'Specialization is required for technicians' })}>
                <option value="">Select a specialization</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.specialization && <p className="form-error">{errors.specialization.message}</p>}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
