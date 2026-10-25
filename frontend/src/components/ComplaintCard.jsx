import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ShieldAlert, 
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import PriorityExplanationModal from './PriorityExplanationModal';

export default function ComplaintCard({ complaint, onUpvoteSuccess }) {
  const [upvotes, setUpvotes] = useState(complaint.upvote_count || 1);
  const [priorityScore, setPriorityScore] = useState(complaint.priority_score);
  const [priorityLevel, setPriorityLevel] = useState(complaint.priority_level);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpvoting(true);
    try {
      const res = await api.upvoteComplaint(complaint.id);
      setUpvotes(res.upvote_count);
      setPriorityScore(res.new_priority_score);
      setPriorityLevel(res.new_priority_level);
      if (onUpvoteSuccess) onUpvoteSuccess(complaint.id, res);
    } catch (err) {
      alert(err.message || "Please sign in to endorse complaints");
    } finally {
      setIsUpvoting(false);
    }
  };

  const getPriorityStyle = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 font-extrabold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      default:
        return 'bg-green-100 text-green-800 border-green-300 font-medium';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return { label: 'Resolved & Closed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'IN_PROGRESS':
        return { label: 'Field Crew Dispatched', bg: 'bg-blue-50 text-blue-800 border-blue-300', icon: Clock };
      case 'ASSIGNED':
        return { label: 'Assigned to Dept', bg: 'bg-purple-50 text-purple-800 border-purple-300', icon: Clock };
      case 'UNDER_REVIEW':
        return { label: 'Municipal Review', bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: AlertTriangle };
      default:
        return { label: 'Report Submitted', bg: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock };
    }
  };

  const statusInfo = getStatusBadge(complaint.status);
  const StatusIcon = statusInfo.icon;
  const duplicateCount = complaint.duplicate_candidates?.length || 0;

  return (
    <>
      <div className="amazon-card p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5 duration-150">
        <div>
          {/* Top header row: Tracking number & Category */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100 text-xs">
            <span className="font-mono text-gray-500 font-semibold">
              #{complaint.tracking_number || `CP-${complaint.id}`}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full text-[11px] truncate max-w-[200px]">
              {complaint.manual_category || complaint.predicted_category}
            </span>
          </div>

          {/* Title in Amazon blue link */}
          <Link to={`/complaints/${complaint.id}`} className="group">
            <h3 className="font-bold text-base text-[#007185] group-hover:text-[#c45500] group-hover:underline line-clamp-2 leading-snug mb-1.5">
              {complaint.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {complaint.description}
          </p>

          {/* Address & Ward */}
          <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-3">
            <MapPin size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{complaint.address}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700 font-medium whitespace-nowrap">{complaint.ward}</span>
          </div>

          {/* Duplicate radar indicator badge if duplicates detected */}
          {duplicateCount > 0 && (
            <div className="mb-3 bg-amber-50 border border-amber-200 rounded p-1.5 flex items-center gap-1.5 text-[11px] text-amber-900">
              <Layers size={13} className="text-amber-600 shrink-0" />
              <span>
                <strong>{duplicateCount} similar report{duplicateCount > 1 ? 's' : ''}</strong> detected nearby
              </span>
            </div>
          )}

          {/* Amazon Price-style Priority Score & Level */}
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-1">
                <span>ML Civic Priority</span>
                <button 
                  onClick={() => setShowPriorityModal(true)} 
                  className="text-gray-400 hover:text-blue-600 transition" 
                  title="Explain Score Calculation"
                >
                  <Info size={12} />
                </button>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs text-gray-600 font-bold">Score</span>
                <span className="text-xl font-extrabold text-[#b12704]">{priorityScore}</span>
                <span className="text-[11px] text-gray-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <button 
                onClick={() => setShowPriorityModal(true)}
                className={`text-[11px] px-2 py-0.5 rounded border ${getPriorityStyle(priorityLevel)} cursor-pointer hover:opacity-90 transition`}
              >
                {priorityLevel} PRIORITY
              </button>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {complaint.category_confidence ? `${Math.round(complaint.category_confidence * 100)}% AI Conf.` : 'AI Verified'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Status & Action buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          {/* Status pill */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border ${statusInfo.bg}`}>
            <StatusIcon size={12} />
            <span className="font-semibold">{statusInfo.label}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Endorse / Upvote Button */}
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded border border-gray-300 transition"
              title="Endorse this complaint to increase municipal priority"
            >
              <ThumbsUp size={12} className={upvotes > 1 ? "text-amazon-amber fill-amazon-amber" : "text-gray-500"} />
              <span>{upvotes}</span>
            </button>

            {/* Track / View Details Link */}
            <Link 
              to={`/complaints/${complaint.id}`}
              className="amazon-btn-primary px-3 py-1 text-xs font-bold flex items-center gap-1"
            >
              <span>Track</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Priority Explanation Modal */}
      {showPriorityModal && (
        <PriorityExplanationModal 
          complaint={complaint} 
          currentScore={priorityScore}
          currentLevel={priorityLevel}
          onClose={() => setShowPriorityModal(false)} 
        />
      )}
    </>
  );
}
