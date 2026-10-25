import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AmazonNavbar from './components/AmazonNavbar';
import AmazonCategoryBar from './components/AmazonCategoryBar';
import HomePage from './pages/HomePage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import MyReportsPage from './pages/MyReportsPage';
import UserLoginPage from './pages/UserLoginPage';
import OfficialLoginPage from './pages/OfficialLoginPage';
import OfficialDashboard from './pages/OfficialDashboard';
import HotspotsPage from './pages/HotspotsPage';
import { ShieldCheck, Heart, ArrowUp } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalCategory, setGlobalCategory] = useState('All');

  const isAuthPage = location.pathname === '/login' || location.pathname === '/official/login';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded] text-[#0f1111]">
      
      {/* Amazon Navigation (hidden on standalone auth screens) */}
      {!isAuthPage && (
        <>
          <AmazonNavbar 
            onSearch={setGlobalSearch}
            selectedCategory={globalCategory}
            onSelectCategory={setGlobalCategory}
          />
          <AmazonCategoryBar 
            selectedCategory={globalCategory}
            onSelectCategory={setGlobalCategory}
          />
        </>
      )}

      {/* Main View Router */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage globalSearch={globalSearch} globalCategory={globalCategory} />} />
          <Route path="/submit" element={<SubmitComplaintPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/official/login" element={<OfficialLoginPage />} />
          <Route path="/official/dashboard" element={<OfficialDashboard />} />
          <Route path="/hotspots" element={<HotspotsPage />} />
        </Routes>
      </div>

      {/* Amazon-Style Multi-tier Footer */}
      {!isAuthPage && (
        <footer className="mt-auto">
          {/* Back to top button */}
          <button 
            onClick={scrollToTop}
            className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <ArrowUp size={14} />
            <span>Back to top</span>
          </button>

          {/* Links Section */}
          <div className="bg-[#232f3e] text-gray-300 py-10 px-4 sm:px-8 border-b border-gray-700">
            <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
              <div>
                <h4 className="font-bold text-white mb-3 text-sm">Get to Know CivicPulse</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:underline text-gray-300">About CivicPulse</Link></li>
                  <li><Link to="/#analytics-section" className="hover:underline text-gray-300">Municipal SLA Targets</Link></li>
                  <li><Link to="/hotspots" className="hover:underline text-gray-300">GIS Open Hotspots</Link></li>
                  <li><Link to="/" className="hover:underline text-gray-300">Citizen Charter</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 text-sm">Municipal Portals</h4>
                <ul className="space-y-2">
                  <li><Link to="/login" className="hover:underline text-gray-300">Citizen Sign In</Link></li>
                  <li><Link to="/submit" className="hover:underline text-gray-300">File a Report</Link></li>
                  <li><Link to="/my-reports" className="hover:underline text-gray-300">Track Filed Issues</Link></li>
                  <li><Link to="/official/login" className="hover:underline text-amazon-amber font-semibold">Official Authority Portal</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 text-sm">AI & ML Architecture</h4>
                <ul className="space-y-2">
                  <li className="text-gray-300">TF-IDF Vectorization</li>
                  <li className="text-gray-300">Logistic Regression Classifier</li>
                  <li className="text-gray-300">Cosine Similarity Deduplication</li>
                  <li className="text-gray-300">Dynamic Priority Scoring Engine</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 text-sm">Deployable Stack</h4>
                <ul className="space-y-2">
                  <li className="text-gray-300">Frontend: React.js + Tailwind</li>
                  <li className="text-gray-300">Backend: FastAPI (Python)</li>
                  <li className="text-gray-300">Database: SQLite / PostgreSQL</li>
                  <li className="text-gray-300">Hosting: Render + Vercel Ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Logo */}
          <div className="bg-[#131921] text-gray-400 py-6 px-4 text-center text-xs">
            <div className="flex items-center justify-center gap-1.5 mb-2 font-bold text-white">
              <span>civic<span className="text-amazon-amber">pulse</span>.city</span>
            </div>
            <p>© 2026 CivicPulse Municipal Civic Operating System. Configured for production deployment on Render & Vercel.</p>
          </div>
        </footer>
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
