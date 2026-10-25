import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileText,
  PlusCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchMyReports = async () => {
      setLoading(true);
      try {
        const data = await api.getComplaints({ citizen_only: true });
        setReports(data);
      } catch (err) {
        console.error("Error loading user reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="amazon-card p-8">
          <Package size={48} className="text-amazon-amber mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Filed Reports</h2>
          <p className="text-xs text-gray-600 mb-6">
            Sign in to your citizen account to track municipal resolution progress and view tracking timelines.
          </p>
          <Link to="/login?redirect=/my-reports" className="amazon-btn-primary px-8 py-2.5 text-xs font-bold inline-block">
            Citizen Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Filter tab logic
  const filteredReports = reports.filter(r => {
    if (activeTab === 'OPEN' && ['RESOLVED', 'REJECTED'].includes(r.status)) return false;
    if (activeTab === 'RESOLVED' && r.status !== 'RESOLVED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || (r.tracking_number && r.tracking_number.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3">
        <Link to="/" className="text-amazon-link hover:underline">Your Account</Link> &gt; <span>Your Filed Reports</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track real-time progress on issues you reported to municipal administration
          </p>
        </div>

        <Link to="/submit" className="amazon-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 w-fit">
          <PlusCircle size={15} />
          <span>Report Another Issue</span>
        </Link>
      </div>

      {/* Search Your Reports Bar (Amazon Orders search) */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#d5d9d9] mb-6 shadow-xs">
        <Search size={16} className="text-gray-400 ml-2" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by issue title or tracking number (e.g. CP-2026-...)"
          className="w-full text-xs text-gray-900 outline-none"
        />
      </div>

      {/* Status Filter Tabs (Amazon Orders tabs) */}
      <div className="flex items-center gap-1 border-b border-gray-300 mb-6 text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Reports' },
          { key: 'OPEN', label: 'Open & In Progress' },
          { key: 'RESOLVED', label: 'Resolved & Closed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 border-b-2 transition -mb-[1px] ${
              activeTab === tab.key
                ? 'border-amazon-orange text-gray-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-[#d5d9d9] p-12 text-center text-gray-500 text-xs">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-amazon-amber border-t-transparent rounded-full mb-2"></div>
          <div>Loading your reports...</div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#d5d9d9] p-12 text-center text-xs text-gray-500">
          <Package size={40} className="text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 text-sm">No reports found</h3>
          <p className="mt-1 text-gray-400">You haven't filed any complaints matching this filter yet.</p>
          <Link to="/submit" className="amazon-btn-primary px-4 py-2 text-xs font-bold mt-4 inline-block">
            File a Civic Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-[#d5d9d9] rounded-lg overflow-hidden shadow-xs">
              
              {/* Card Header (Amazon Order style gray banner) */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">Reported Placed</span>
                    <strong className="text-gray-800">
                      {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">Priority Level</span>
                    <strong className="text-[#b12704]">{report.priority_level} ({report.priority_score})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">Category</span>
                    <strong className="text-gray-800">{report.manual_category || report.predicted_category}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-gray-500 block">Incident Number</span>
                  <span className="font-mono font-bold text-gray-900">{report.tracking_number}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    {report.estimated_resolution_time && (
                      <span className="text-xs text-gray-500">
                        Target SLA: <strong>{report.estimated_resolution_time}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-gray-900">
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-[11px] text-gray-500">
                    Location: <span className="text-gray-700 font-medium">{report.address}</span> • Ward: <span className="text-gray-700">{report.ward}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0 md:w-48">
                  <Link 
                    to={`/complaints/${report.id}`}
                    className="amazon-btn-primary py-2 text-center text-xs font-bold"
                  >
                    Track Package / Report
                  </Link>
                  <Link 
                    to={`/complaints/${report.id}`}
                    className="amazon-btn-outline py-1.5 text-center text-xs font-medium"
                  >
                    View Details & Notes
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
