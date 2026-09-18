import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Lightbulb, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [simulationToken, setSimulationToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSubmitted(true);
        if (response.data.resetToken) {
          setSimulationToken(response.data.resetToken);
        }
        showToast('Password reset token generated', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200/80 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-500">Enter your email to receive password reset instructions</p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
              Reset instructions sent. If this is a simulation, use the reset link or token below:
            </div>
            {simulationToken && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs break-all font-mono text-gray-700">
                Token: {simulationToken}
                <div className="mt-2">
                  <Link to={`/reset-password?token=${simulationToken}`} className="text-brand-600 font-semibold underline">
                    Go to Reset Password Page
                  </Link>
                </div>
              </div>
            )}
            <Link to="/login" className="block text-sm font-semibold text-brand-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
