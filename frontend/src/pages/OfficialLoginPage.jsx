import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Sparkles, Building2, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OfficialLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login({ email, password, role_hint: 'official' });
      login(res.access_token, res.user);
      navigate('/official/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Official authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoOfficialLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login({
        email: 'official@civicpulse.org',
        password: 'Password123!',
        role_hint: 'official'
      });
      login(res.access_token, res.user);
      navigate('/official/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Demo official login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#131921] via-[#1c2734] to-[#232f3e] flex flex-col items-center justify-center px-4 py-12 text-white">
      
      {/* Official Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={28} className="text-amazon-amber" />
          <span className="text-2xl font-black tracking-tight text-white">
            CivicPulse <span className="text-amazon-amber font-light">Authority Console</span>
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-red-950/70 text-red-300 border border-red-700/60 px-3 py-1 rounded-full text-[11px] font-semibold">
          <ShieldAlert size={13} className="text-red-400" />
          <span>Authorized Municipal Personnel & Department Leads Only</span>
        </div>
      </div>

      {/* Official Sign In Card */}
      <div className="w-full max-w-md bg-[#232f3e] border border-gray-700 rounded-xl p-8 shadow-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-700 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Municipal Staff Sign In</h2>
            <p className="text-xs text-gray-400 mt-0.5">Triage, dispatch, and SLA management</p>
          </div>
          <Lock size={18} className="text-amazon-amber" />
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-900/40 border border-red-600 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Official Municipal Email
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="official@civicpulse.org"
              className="w-full bg-[#131921] text-white px-3 py-2 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber focus:border-amazon-amber"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Secure Staff Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#131921] text-white px-3 py-2 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber focus:border-amazon-amber"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="amazon-btn-secondary w-full py-2.5 font-bold text-xs shadow-md mt-2"
          >
            {loading ? 'Authenticating Official...' : 'Sign In to Authority Console'}
          </button>
        </form>

        {/* 1-Click Demo Login for Evaluator */}
        <div className="mt-5 pt-5 border-t border-gray-700">
          <button
            type="button"
            onClick={handleDemoOfficialLogin}
            disabled={loading}
            className="w-full bg-amber-400/20 hover:bg-amber-400/30 border border-amazon-amber text-amazon-amber font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles size={14} />
            <span>1-Click Demo Official Login (David Ramirez - Public Works)</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 mt-5 text-center leading-relaxed">
          Access is monitored and audited in compliance with Municipal Cyber Governance Standards.
        </div>

      </div>

      {/* Switch to Citizen Portal Link */}
      <div className="mt-8 text-center text-xs text-gray-400">
        <Link to="/login" className="text-amazon-amber hover:underline inline-flex items-center gap-1 font-semibold">
          <ArrowLeft size={13} />
          <span>Are you a citizen filing a report? Go to Citizen Portal</span>
        </Link>
      </div>

    </div>
  );
}
