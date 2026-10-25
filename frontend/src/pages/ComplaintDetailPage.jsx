import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  AlertTriangle, 
  User, 
  Info,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Award
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AmazonTrackingStepper from '../components/AmazonTrackingStepper';
import PriorityExplanationModal from '../components/PriorityExplanationModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user, isOfficial } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Official Action Form State
  const [newStatus, setNewStatus] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [officialRemarks, setOfficialRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaintDetail(id);
      setComplaint(data);
      setNewStatus(data.status);
      setAssignedOfficer(data.assigned_officer || '');
      setOfficialRemarks(data.official_remarks || '');
    } catch (err) {
      setErrorMsg(err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpvote = async () => {
    if (!user) {
      alert("Please sign in as a citizen to endorse this report");
      return;
    }
    setIsUpvoting(true);
    try {
      const res = await api.upvoteComplaint(complaint.id);
      setComplaint(prev => ({
        ...prev,
        upvote_count: res.upvote_count,
        priority_score: res.new_priority_score,
        priority_level: res.new_priority_level
      }));
    } catch (err) {
      alert(err.message || "Could not complete endorsement");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleOfficialUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    setActionSuccess('');
    try {
      const updated = await api.updateStatus(complaint.id, {
        status: newStatus,
        assigned_officer: assignedOfficer,
        official_remarks: officialRemarks
      });
      setComplaint(updated);
      setActionSuccess('Municipal status updated successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-16 text-center text-gray-500">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-amazon-amber border-t-transparent rounded-full mb-3"></div>
        <div className="text-sm font-semibold">Retrieving tracking file...</div>
      </div>
    );
  }

  if (errorMsg || !complaint) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <AlertTriangle size={36} className="text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Complaint Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{errorMsg || "The requested tracking number does not exist."}</p>
        <Link to="/" className="amazon-btn-primary px-4 py-2 text-xs font-bold mt-4 inline-block">
          Return to All Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 pb-16">
      
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="text-amazon-link hover:underline">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-700">{complaint.manual_category || complaint.predicted_category}</span>
        <span>&gt;</span>
        <span className="font-mono text-gray-900 font-bold">{complaint.tracking_number}</span>
      </div>

      {/* 1. Amazon Package Tracking Stepper */}
      <div className="mb-6">
        <AmazonTrackingStepper complaint={complaint} />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Details, Location Map, Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Complaint Overview Card */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4 text-xs">
              <span className="font-mono text-gray-500 font-bold">
                Incident ID: #{complaint.tracking_number}
              </span>
              <span className="text-gray-400">
                Filed on {new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-3">
              {complaint.title}
            </h1>

            {/* Department Tag & Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200">
                {complaint.manual_category || complaint.predicted_category}
              </span>
              <span className="text-xs text-gray-500">
                Department: <strong className="text-gray-800">{complaint.department}</strong>
              </span>
              {complaint.category_confidence && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                  {Math.round(complaint.category_confidence * 100)}% ML Match
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5 whitespace-pre-line">
              {complaint.description}
            </div>

            {/* Address & Citizen Reporter Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-gray-100 pt-4 text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-amazon-amber mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">Incident Location</div>
                  <div>{complaint.address}</div>
                  <div className="text-gray-500 font-semibold mt-0.5">{complaint.ward}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">Reported By</div>
                  <div>{complaint.citizen_name}</div>
                  <div className="text-gray-400 text-[11px]">Verified Citizen Report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Pin Map */}
          {complaint.latitude && complaint.longitude && (
            <div className="bg-white border border-[#d5d9d9] rounded-xl p-5 shadow-xs">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                <MapPin size={16} className="text-red-500" />
                <span>Geographical Location Pin</span>
              </h3>
              <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[complaint.latitude, complaint.longitude]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[complaint.latitude, complaint.longitude]} icon={customMarkerIcon}>
                    <Popup>
                      <div className="text-xs p-1">
                        <strong>{complaint.title}</strong>
                        <div className="text-gray-500">{complaint.address}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Activity Logs / Audit Trail (Amazon Order Updates Style) */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-1.5">
              <Clock size={16} className="text-amazon-link" />
              <span>Incident Activity Audit Trail</span>
            </h3>

            {complaint.activity_logs && complaint.activity_logs.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {complaint.activity_logs.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    {/* Bullet */}
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amazon-orange border-2 border-white shadow-xs" />
                    
                    <div className="flex items-center justify-between text-gray-500 text-[11px] mb-0.5">
                      <span className="font-bold text-gray-800">
                        {log.performed_by_name} ({log.performed_by_role})
                      </span>
                      <span>
                        {new Date(log.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="font-semibold text-gray-900 mb-0.5">
                      {log.action.replace('_', ' ')}
                    </div>
                    {log.note && (
                      <div className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                        {log.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-3 text-center">
                Initial complaint submission recorded. Awaiting dispatch update.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col): Amazon "Buy Box" / Status & Action Console */}
        <div className="space-y-6">
          
          {/* Amazon Resolution Box */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Price / Priority Score Header */}
            <div className="pb-3 border-b border-gray-200">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                ML Calculated Urgency
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-[#b12704]">{complaint.priority_score}</span>
                <span className="text-xs text-gray-500">/ 100</span>
                <span className="ml-auto text-xs font-black px-2.5 py-0.5 rounded uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  {complaint.priority_level}
                </span>
              </div>
              <button 
                onClick={() => setShowPriorityModal(true)}
                className="text-amazon-link hover:underline text-xs flex items-center gap-1 font-semibold mt-2"
              >
                <Info size={13} />
                <span>Why is this priority score {complaint.priority_score}?</span>
              </button>
            </div>

            {/* SLA Status */}
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Target SLA:</span>
                <span className="font-bold text-gray-800">{complaint.estimated_resolution_time || 'Within 24-48h'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned Officer:</span>
                <span className="font-bold text-gray-800">{complaint.assigned_officer || 'Pending Assignment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-bold text-amazon-darkOrange">{complaint.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Citizen Endorse Button */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleUpvote}
                disabled={isUpvoting}
                className="amazon-btn-primary w-full py-2.5 text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <ThumbsUp size={15} className="fill-gray-900" />
                <span>Endorse Issue ({complaint.upvote_count} Citizens)</span>
              </button>
              <div className="text-[10px] text-gray-500 text-center mt-1.5 leading-tight">
                Citizen endorsements dynamically boost municipal priority scores.
              </div>
            </div>

          </div>

          {/* Duplicate Reports Radar */}
          {complaint.duplicate_candidates && complaint.duplicate_candidates.length > 0 && (
            <div className="bg-white border border-[#d5d9d9] rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                <Layers size={14} className="text-purple-600" />
                <span>Linked / Duplicate Candidates ({complaint.duplicate_candidates.length})</span>
              </h4>
              <div className="space-y-2.5">
                {complaint.duplicate_candidates.map((cand) => (
                  <div key={cand.complaint_id} className="p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg text-xs">
                    <div className="flex justify-between text-[10px] font-mono text-purple-800 mb-1">
                      <span>#{cand.tracking_number}</span>
                      <span className="font-bold">{cand.similarity_percent}% match</span>
                    </div>
                    <div className="font-bold text-gray-900 line-clamp-1 mb-1">{cand.title}</div>
                    <Link 
                      to={`/complaints/${cand.complaint_id}`}
                      className="text-xs font-bold text-amazon-link hover:underline block"
                    >
                      Compare Report →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Municipal Official Action Console (Visible to Officials & Admins) */}
          {isOfficial ? (
            <div className="bg-gradient-to-b from-[#232f3e] to-[#131921] text-white rounded-xl p-5 shadow-lg border border-gray-700">
              <div className="flex items-center gap-1.5 text-amazon-amber text-xs font-black uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
                <ShieldAlert size={16} />
                <span>Official Triage Console</span>
              </div>

              {actionSuccess && (
                <div className="mb-3 p-2 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs rounded">
                  {actionSuccess}
                </div>
              )}

              <form onSubmit={handleOfficialUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2.5 py-1.5 outline-none font-bold text-xs"
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
                  <label className="block text-gray-300 font-semibold mb-1">Assign Field Officer</label>
                  <input
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="e.g. Officer R. Sharma, Unit 4"
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2.5 py-1.5 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Official Remarks</label>
                  <textarea
                    rows={3}
                    value={officialRemarks}
                    onChange={(e) => setOfficialRemarks(e.target.value)}
                    placeholder="Provide action log notes or resolution evidence..."
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2.5 py-1.5 outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="amazon-btn-secondary w-full py-2 text-xs font-bold shadow"
                >
                  {updatingStatus ? 'Updating...' : 'Commit Municipal Action'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
              <div className="font-bold text-gray-800 flex items-center gap-1 mb-1">
                <ShieldAlert size={14} className="text-gray-500" />
                <span>Municipal Staff Portal</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Authorized municipal officers can sign in to transition complaint status, assign field engineers, and log repairs.
              </p>
              <Link to="/official/login" className="text-amazon-link hover:underline font-bold text-xs mt-2 block">
                Official Staff Sign-In →
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* Priority Explanation Modal */}
      {showPriorityModal && (
        <PriorityExplanationModal
          complaint={complaint}
          currentScore={complaint.priority_score}
          currentLevel={complaint.priority_level}
          onClose={() => setShowPriorityModal(false)}
        />
      )}

    </div>
  );
}
