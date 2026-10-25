import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, UserCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function UserLoginPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const redirectPath = searchParams.get('redirect') || '/';

  const [tab, setTab] = useState(initialTab);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Central Zone');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login({ email, password, role_hint: 'citizen' });
        login(res.access_token, res.user);
        navigate(redirectPath);
      } else {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          role: 'citizen',
          ward,
          phone
        });
        login(res.access_token, res.user);
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login({
        email: 'citizen@civicpulse.org',
        password: 'Password123!',
        role_hint: 'citizen'
      });
      login(res.access_token, res.user);
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      
      {/* Amazon-style Logo */}
      <Link to="/" className="flex flex-col items-center mb-6">
        <div className="text-2xl font-black tracking-tight text-gray-900">
          civic<span className="text-amazon-amber">pulse</span><span className="text-xs text-gray-500 font-semibold">.city</span>
        </div>
        <div className="w-24 h-1 bg-amazon-amber rounded-full mt-0.5"></div>
        <span className="text-xs text-gray-500 font-semibold mt-1">Citizen Portal</span>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white border border-[#d5d9d9] rounded-lg p-7 shadow-sm">
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {tab === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {tab === 'register' && (
            <>
              <div>
                <label className="block font-bold text-gray-800 mb-1">Full Name</label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amazon-amber"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Ward / Zone</label>
                <select 
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded outline-none bg-white font-medium"
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Metro District">North Metro District</option>
                  <option value="East Commercial Zone">East Commercial Zone</option>
                  <option value="South Heritage Zone">South Heritage Zone</option>
                  <option value="West Residential Zone">West Residential Zone</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Mobile Phone (Optional)</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amazon-amber"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-gray-800 mb-1">Email address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@civicpulse.org"
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amazon-amber text-xs"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-gray-800">Password</label>
              {tab === 'login' && (
                <span className="text-[11px] text-amazon-link hover:underline cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-amazon-amber text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="amazon-btn-primary w-full py-2 font-bold text-xs shadow-xs transition"
          >
            {loading ? 'Authenticating...' : (tab === 'login' ? 'Continue' : 'Create your CivicPulse account')}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles size={14} className="text-amazon-amber" />
            <span>1-Click Demo Citizen Login</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-500 mt-4 leading-relaxed">
          By signing in, you agree to CivicPulse's Municipal Transparency Conditions of Use and Privacy Notice.
        </div>

      </div>

      {/* Toggle Tab */}
      <div className="w-full max-w-sm mt-5 text-center text-xs">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-3 text-gray-500 font-medium">
            {tab === 'login' ? 'New to CivicPulse?' : 'Already have a citizen account?'}
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={() => {
            setTab(tab === 'login' ? 'register' : 'login');
            setErrorMsg('');
          }}
          className="amazon-btn-outline w-full py-2 text-xs font-semibold mt-2"
        >
          {tab === 'login' ? 'Create your CivicPulse citizen account' : 'Sign in with existing account'}
        </button>
      </div>

      {/* Switch to Official Portal Link */}
      <div className="mt-8 bg-gray-50 border border-gray-300 rounded-lg p-3 text-center text-xs max-w-sm w-full">
        <span className="text-gray-600">Municipal or Authority Officer? </span>
        <Link to="/official/login" className="text-amazon-link hover:underline font-bold inline-flex items-center gap-1">
          <span>Authority Portal Login</span>
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}
