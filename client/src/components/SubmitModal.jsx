import React, { useState } from 'react';
import { Modal } from './Modal';
import api from '../api/axios';

const categories = ['UI/UX', 'Integrations', 'Performance', 'General'];

export const SubmitModal = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/posts', { title, description, category });
      if (response.data.success) {
        showToast('Feature request submitted successfully', 'success');
        setTitle('');
        setDescription('');
        setCategory('General');
        onSuccess(response.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit feature request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit a Feature Idea">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Title *</label>
          <input
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dark mode support for dashboard"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Description (Markdown supported) *</label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your feature idea and why it would be useful..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Idea'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
