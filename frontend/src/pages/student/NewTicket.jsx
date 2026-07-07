// ---------------------------------------------------------
// pages/student/NewTicket.jsx
// Ticket submission form. Sends a multipart/form-data request
// so the optional proof image/video reaches Multer/Cloudinary
// on the backend alongside the structured ticket fields.
// ---------------------------------------------------------

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axiosInstance';

const MAX_FILE_MB = 25;

const NewTicket = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewName, setPreviewName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('labName', formData.labName);
      payload.append('rowNumber', formData.rowNumber);
      payload.append('pcNumber', formData.pcNumber);
      payload.append('issueDescription', formData.issueDescription);

      const file = formData.mediaFile?.[0];
      if (file) {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          setServerError(`File is too large. Maximum size is ${MAX_FILE_MB}MB.`);
          setSubmitting(false);
          return;
        }
        payload.append('mediaFile', file);
      }

      await api.post('/tickets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/student', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">Report an Issue</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Provide exact lab location details so a technician can find the affected system quickly.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6" encType="multipart/form-data">
          {serverError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label" htmlFor="labName">Lab Name</label>
              <input id="labName" className="form-input" placeholder="e.g. CS Lab 2" {...register('labName', { required: 'Lab name is required' })} />
              {errors.labName && <p className="form-error">{errors.labName.message}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="rowNumber">Row Number</label>
              <input id="rowNumber" className="form-input" placeholder="e.g. 3" {...register('rowNumber', { required: 'Row is required' })} />
              {errors.rowNumber && <p className="form-error">{errors.rowNumber.message}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="pcNumber">PC Number</label>
              <input id="pcNumber" className="form-input" placeholder="e.g. 14" {...register('pcNumber', { required: 'PC number is required' })} />
              {errors.pcNumber && <p className="form-error">{errors.pcNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="issueDescription">Describe the Issue</label>
            <textarea
              id="issueDescription"
              rows={4}
              className="form-input resize-none"
              placeholder="e.g. Monitor doesn't turn on, keyboard keys unresponsive..."
              {...register('issueDescription', {
                required: 'Please describe the issue',
                minLength: { value: 10, message: 'Please provide at least 10 characters' },
              })}
            />
            {errors.issueDescription && <p className="form-error">{errors.issueDescription.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="mediaFile">Attach Proof (Photo or Video, optional)</label>
            <input
              id="mediaFile"
              type="file"
              accept="image/*,video/*"
              className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
              {...register('mediaFile', {
                onChange: (e) => setPreviewName(e.target.files?.[0]?.name || ''),
              })}
            />
            {previewName && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Selected: {previewName}</p>}
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Max {MAX_FILE_MB}MB. JPG, PNG, WEBP, MP4, MOV, AVI, WEBM supported.</p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default NewTicket;
