import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Filter, 
  ArrowUpDown, 
  Search,
  ExternalLink,
  Flame,
  BarChart3,
  RefreshCw,
  Merge
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import HotspotMap from '../components/HotspotMap';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function OfficialDashboard() {
  const { user, isOfficial } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'hotspots' | 'analytics'

  // Action Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [compData, analyticsData] = await Promise.all([
        api.getComplaints({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          search: searchQuery || undefined,
          sort_by: 'priority'
        }),
        api.getAnalyticsOverview()
      ]);
      setComplaints(compData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      await api.updateStatus(selectedComplaint.id, {
        status: statusToUpdate,
        assigned_officer: assignedOfficer,
        official_remarks: remarks
      });
      setActionNotice(`Status updated to ${statusToUpdate} for #${selectedComplaint.tracking_number}`);
      setSelectedComplaint(null);
      loadData();
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      alert(err.message || "Failed to update complaint");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeDuplicate = async (secondaryId, primaryId) => {
    if (!window.confirm("Merge this duplicate complaint into the primary ticket? This will consolidate citizen reports and boost civic priority.")) return;
    try {
      await api.mergeComplaint(secondaryId, primaryId, "Consolidated via Official Dashboard Duplicate Radar");
      setActionNotice("Successfully merged duplicate report into primary incident!");
      loadData();
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      alert(err.message || "Merge failed");
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-6 pb-16">
      
      {/* Officer Header Card */}
      <div className="bg-[#232f3e] text-white rounded-xl p-5 mb-6 border border-gray-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amazon-amber text-gray-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Municipal Desk
            </span>
            <span className="text-gray-400 text-xs">Jurisdiction: {user?.ward || 'Central Headquarters'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Welcome, Officer {user?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs text-gray-300 mt-0.5">
            Department: <strong className="text-amazon-amber">{user?.department || 'Public Works & Infrastructure'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="amazon-btn-outline px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>Refresh Queue</span>
          </button>
          <Link to="/submit" className="amazon-btn-primary px-3 py-1.5 text-xs font-bold">
            + File Manual Ticket
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Analytics KPI Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9]">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Pending Triage</span>
            <span className="text-xl font-black text-amber-600">{analytics.pending_complaints}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9]">
            <span className="text-[10px] font-bold text-red-600 uppercase block">Critical Incidents</span>
            <span className="text-xl font-black text-red-700">{analytics.critical_complaints}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9]">
            <span className="text-[10px] font-bold text-blue-600 uppercase block">Field Dispatched</span>
            <span className="text-xl font-black text-blue-700">{analytics.in_progress_complaints}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9]">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Resolved SLA</span>
            <span className="text-xl font-black text-emerald-700">{analytics.resolved_complaints}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9]">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Duplicates Merged</span>
            <span className="text-xl font-black text-purple-700">{analytics.duplicates_flagged || 2}</span>
          </div>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-300 mb-6 text-xs font-bold">
        {[
          { key: 'queue', label: 'Municipal Triage Queue', icon: Clock },
          { key: 'hotspots', label: 'GIS Hotspot Map', icon: Flame },
          { key: 'analytics', label: 'Department Analytics & SLAs', icon: BarChart3 }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition -mb-[1px] ${
                activeTab === t.key
                  ? 'border-amazon-orange text-gray-900 font-extrabold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={14} className={activeTab === t.key ? 'text-amazon-orange' : 'text-gray-400'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          
          {/* Filters Row */}
          <div className="bg-white p-3 rounded-lg border border-[#d5d9d9] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded px-2 py-1 font-bold text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Category:</span>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded px-2 py-1 font-bold text-xs max-w-[180px] truncate"
                >
                  <option value="All">All Departments</option>
                  <option value="Roads & Potholes">Roads & Potholes</option>
                  <option value="Waste Management & Garbage">Waste Management</option>
                  <option value="Water Supply & Leakage">Water Supply</option>
                  <option value="Drainage & Sewage">Drainage & Sewage</option>
                  <option value="Streetlights & Electricity">Streetlights</option>
                  <option value="Public Health & Sanitation">Public Health</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket title, tracking #..."
                className="border border-gray-300 rounded px-2.5 py-1 text-xs outline-none w-56"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Priority / Tracking</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4">Category & Ward</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Unit</th>
                    <th className="py-3 px-4">Duplicates</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Loading municipal queue...
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        No complaints match active filter parameters.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => {
                      const isCritical = c.priority_level === 'CRITICAL';
                      const dupCount = c.duplicate_candidates?.length || 0;

                      return (
                        <tr key={c.id} className="hover:bg-amber-50/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                isCritical ? 'bg-red-100 text-red-800' :
                                c.priority_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {c.priority_level} ({c.priority_score})
                              </span>
                            </div>
                            <div className="font-mono text-gray-500 font-semibold text-[11px] mt-1">
                              #{c.tracking_number}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <Link to={`/complaints/${c.id}`} className="font-bold text-gray-900 hover:text-amazon-link line-clamp-1 block">
                              {c.title}
                            </Link>
                            <span className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{c.address}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-800">{c.manual_category || c.predicted_category}</div>
                            <div className="text-gray-500 text-[11px]">{c.ward}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                              c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {c.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-gray-700">
                            {c.assigned_officer || <span className="text-gray-400 italic">Unassigned</span>}
                          </td>

                          <td className="py-3.5 px-4">
                            {dupCount > 0 ? (
                              <div className="flex items-center gap-1 text-purple-700 font-bold text-[11px]">
                                <Layers size={13} />
                                <span>{dupCount} flagged</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Unique</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setStatusToUpdate(c.status);
                                setAssignedOfficer(c.assigned_officer || '');
                                setRemarks(c.official_remarks || '');
                              }}
                              className="amazon-btn-primary px-3 py-1 font-bold text-[11px]"
                            >
                              Dispatch / Update
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: GIS Hotspots */}
      {activeTab === 'hotspots' && (
        <div className="space-y-4">
          <HotspotMap complaints={complaints} height="560px" />
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-4">
          <AnalyticsCharts analytics={analytics} />
        </div>
      )}

      {/* Quick Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-300 overflow-hidden">
            <div className="bg-[#232f3e] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Action Ticket #{selectedComplaint.tracking_number}</span>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident</label>
                <div className="font-semibold text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                  {selectedComplaint.title}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Lifecycle Status</label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-bold"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assign Field Crew / Engineer</label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="e.g. Squad Lead V. Sharma"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Notes / Remarks</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter official resolution notes or dispatch orders..."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5"
                />
              </div>

              {/* If duplicates exist, allow one-click merge into this complaint */}
              {selectedComplaint.duplicate_candidates?.length > 0 && (
                <div className="bg-purple-50 p-2.5 rounded border border-purple-200">
                  <div className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                    <Merge size={13} />
                    <span>Merge Duplicate Tickets:</span>
                  </div>
                  {selectedComplaint.duplicate_candidates.map(d => (
                    <div key={d.complaint_id} className="flex items-center justify-between py-1 border-t border-purple-100 text-[11px]">
                      <span className="truncate max-w-[200px]">#{d.tracking_number}: {d.title}</span>
                      <button
                        type="button"
                        onClick={() => handleMergeDuplicate(d.complaint_id, selectedComplaint.id)}
                        className="text-purple-800 bg-white border border-purple-300 hover:bg-purple-100 px-2 py-0.5 rounded font-bold"
                      >
                        Merge
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="amazon-btn-outline px-4 py-1.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="amazon-btn-primary px-4 py-1.5 font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Commit Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
