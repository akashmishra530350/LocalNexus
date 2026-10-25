import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Flame, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  Search,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import ComplaintCard from '../components/ComplaintCard';
import AnalyticsCharts from '../components/AnalyticsCharts';
import HotspotMap from '../components/HotspotMap';

export default function HomePage({ globalSearch, globalCategory }) {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  const [sortBy, setSortBy] = useState('priority');

  const searchQuery = globalSearch || searchParams.get('search') || '';
  const selectedCategory = globalCategory || 'All';

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        ward: wardFilter !== 'All' ? wardFilter : undefined,
        search: searchQuery || undefined,
        sort_by: sortBy
      });
      setComplaints(data);
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalyticsOverview();
      setAnalytics(data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, statusFilter, priorityFilter, wardFilter, sortBy, searchQuery]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUpvoteSuccess = (id, updatedData) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          upvote_count: updatedData.upvote_count,
          priority_score: updatedData.new_priority_score,
          priority_level: updatedData.new_priority_level
        };
      }
      return c;
    }));
  };

  const departmentsList = [
    { title: "Roads & Potholes", icon: "🚧", desc: "Craters, asphalt peeling, broken dividers" },
    { title: "Waste Management & Garbage", icon: "🗑️", desc: "Overflowing bins, uncollected trash, illegal dumping" },
    { title: "Water Supply & Leakage", icon: "💧", desc: "Pipe bursts, zero pressure, muddy water" },
    { title: "Drainage & Sewage", icon: "🌊", desc: "Open manholes, blocked stormwater culverts" },
    { title: "Streetlights & Electricity", icon: "💡", desc: "Sparking lines, blackout streets, damaged poles" },
    { title: "Public Health & Sanitation", icon: "🏥", desc: "Dengue breeding, dirty public toilets, pests" }
  ];

  return (
    <div className="min-w-0 pb-16">
      
      {/* 1. Amazon-Style Hero Banner */}
      <div className="relative bg-gradient-to-r from-amazon via-[#1c2a39] to-amazon-light text-white py-8 px-4 sm:px-8 border-b border-gray-700 shadow-md">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-amazon-amber/20 text-amazon-amber border border-amazon-amber/40 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Sparkles size={14} />
              <span>AI-Powered Municipal Civic Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Report Civic Issues. <br />
              <span className="text-amazon-amber">Fast-Track Municipal Action</span> with ML Triage.
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-2.5 max-w-xl leading-relaxed">
              CivicPulse uses machine learning to classify complaints in real-time, weed out duplicate reports via cosine similarity, compute transparent urgency scores, and coordinate rapid municipal field dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Link 
                to="/submit" 
                className="amazon-btn-secondary px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5"
              >
                <span>Report an Issue (60s)</span>
                <ChevronRight size={16} />
              </Link>
              <Link 
                to="/hotspots" 
                className="amazon-btn-outline px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5"
              >
                <Flame size={16} className="text-red-600" />
                <span>Explore City Hotspot Radar</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Pill Panel */}
          {analytics && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 w-full md:w-80 space-y-3 text-xs">
              <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Live Municipal Status</div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Active Complaints:</span>
                <span className="text-lg font-black text-white">{analytics.total_complaints}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Critical Hotspots:</span>
                <span className="text-lg font-black text-red-400">{analytics.critical_complaints}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Avg Resolution:</span>
                <span className="text-lg font-black text-amazon-amber">{analytics.average_resolution_hours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Duplicate Clusters:</span>
                <span className="text-lg font-black text-emerald-400">{analytics.duplicates_flagged || 2}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Body: Amazon Faceted Search Layout */}
      <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-6">
        
        {/* Results Info Bar */}
        <div className="bg-white border border-[#d5d9d9] rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div>
            <span className="text-gray-600">Showing </span>
            <strong className="text-gray-900">{complaints.length} results</strong>
            {selectedCategory !== 'All' && <span> in <strong className="text-amazon-link">{selectedCategory}</strong></span>}
            {searchQuery && <span> for "<strong className="text-[#c45500]">{searchQuery}</strong>"</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold flex items-center gap-1">
              <ArrowUpDown size={13} />
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs font-bold text-gray-800 outline-none cursor-pointer hover:border-gray-400"
            >
              <option value="priority">🔥 ML Priority Score (High to Low)</option>
              <option value="newest">🕒 Newest Reports First</option>
              <option value="upvotes">👍 Most Endorsed by Citizens</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar: Amazon-Style Facet Filters */}
          <aside className="lg:col-span-1 space-y-5">
            
            {/* Filter by Status */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-4 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-3 pb-1 border-b border-gray-100 flex items-center justify-between">
                <span>Filter by Lifecycle</span>
                <Filter size={13} className="text-gray-400" />
              </h4>
              <div className="space-y-1.5 text-xs">
                {['All', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                      statusFilter === st ? 'bg-amber-100 font-bold text-gray-900' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{st === 'All' ? 'All Statuses' : st.replace('_', ' ')}</span>
                    {statusFilter === st && <span className="text-amazon-amber">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Priority */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-4 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-3 pb-1 border-b border-gray-100">
                Civic Urgency Tier
              </h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'All Urgencies', val: 'All', color: 'text-gray-700' },
                  { label: '🔴 CRITICAL (75-100)', val: 'CRITICAL', color: 'text-red-700 font-bold' },
                  { label: '🟠 HIGH (55-74)', val: 'HIGH', color: 'text-orange-700 font-semibold' },
                  { label: '🟡 MEDIUM (35-54)', val: 'MEDIUM', color: 'text-amber-700' },
                  { label: '🟢 LOW (0-34)', val: 'LOW', color: 'text-green-700' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setPriorityFilter(item.val)}
                    className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                      priorityFilter === item.val ? 'bg-amber-100 font-bold text-gray-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className={item.color}>{item.label}</span>
                    {priorityFilter === item.val && <span className="text-amazon-amber">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Municipal Zone */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-4 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-3 pb-1 border-b border-gray-100 flex items-center gap-1">
                <MapPin size={13} className="text-amazon-amber" />
                <span>Municipal Ward</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {['All', 'Central Zone', 'North Metro District', 'East Commercial Zone', 'South Heritage Zone', 'West Residential Zone'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWardFilter(w)}
                    className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                      wardFilter === w ? 'bg-amber-100 font-bold text-gray-900' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{w === 'All' ? 'All Zones' : w}</span>
                    {wardFilter === w && <span className="text-amazon-amber">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Demo Credentials Reminder Box */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950">
              <div className="font-bold text-gray-900 flex items-center gap-1 mb-1">
                <ShieldCheck size={14} className="text-amazon-amber" />
                <span>Evaluation Credentials:</span>
              </div>
              <div className="space-y-1 text-[11px] text-gray-700">
                <p>👤 <strong>Citizen:</strong> citizen@civicpulse.org</p>
                <p>🏛️ <strong>Official:</strong> official@civicpulse.org</p>
                <p className="text-[10px] text-gray-500 mt-1">Pass: Password123! (or use 1-click login on login pages)</p>
              </div>
            </div>

          </aside>

          {/* Right Main Grid: Complaint Cards */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="bg-white border border-[#d5d9d9] rounded-xl p-12 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-amazon-amber border-t-transparent rounded-full mb-3"></div>
                <div className="text-sm font-semibold">Loading municipal incident catalog...</div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white border border-[#d5d9d9] rounded-xl p-12 text-center">
                <AlertTriangle size={36} className="text-amber-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gray-900">No complaints matching your criteria</h3>
                <p className="text-xs text-gray-500 mt-1">Try clearing your filters or search terms.</p>
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setPriorityFilter('All');
                    setWardFilter('All');
                  }}
                  className="amazon-btn-primary px-4 py-1.5 text-xs font-bold mt-4"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map((c) => (
                  <ComplaintCard 
                    key={c.id} 
                    complaint={c} 
                    onUpvoteSuccess={handleUpvoteSuccess}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

        {/* 3. Hotspots Map Section */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Flame className="text-red-600" size={22} />
                <span>Geographical Hotspots & Active Clusters</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Visualizing civic complaints across municipal sectors using OpenStreetMap and Leaflet
              </p>
            </div>
            <Link to="/hotspots" className="amazon-btn-outline px-3 py-1.5 text-xs font-bold">
              Full-Screen Map →
            </Link>
          </div>
          <HotspotMap complaints={complaints} height="420px" />
        </section>

        {/* 4. Analytics Section */}
        <section id="analytics-section" className="mt-12 pt-6 border-t border-gray-300">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-amazon-link" size={22} />
              <span>Municipal Infrastructure Analytics & SLAs</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Data-driven insights to support municipal planning, resource allocation, and response time reduction
            </p>
          </div>
          {analytics && <AnalyticsCharts analytics={analytics} />}
        </section>

      </div>
    </div>
  );
}
