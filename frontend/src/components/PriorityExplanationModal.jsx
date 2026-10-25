import React from 'react';
import { X, CheckCircle, ShieldAlert, Zap, Clock, Users, Layers, Award } from 'lucide-react';

export default function PriorityExplanationModal({ complaint, currentScore, currentLevel, onClose }) {
  const breakdown = complaint.priority_breakdown || {};
  const rationale = breakdown.rationale || [];

  const factors = [
    {
      title: "Urgency Keywords Impact",
      points: breakdown.keyword_urgency || 0,
      max: 35,
      icon: Zap,
      desc: "Detects hazards like open manholes, sparking cables, live wires, cave-ins, and gas/chemical leaks.",
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Category Inherent Severity",
      points: breakdown.category_baseline || 18,
      max: 26,
      icon: ShieldAlert,
      desc: `Baseline infrastructure weight assigned to '${complaint.manual_category || complaint.predicted_category}'.`,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Volume & Duplicate Multiplier",
      points: breakdown.duplicate_volume || 0,
      max: 20,
      icon: Layers,
      desc: "Escalates priority when multiple citizens report recurring issues at or near the same location.",
      color: "text-purple-600 bg-purple-50"
    },
    {
      title: "SLA Aging Escalation",
      points: breakdown.sla_aging || 0,
      max: 15,
      icon: Clock,
      desc: "Dynamically raises priority if complaints remain unattended beyond 48 hours or breach municipal SLAs.",
      color: "text-red-600 bg-red-50"
    },
    {
      title: "Citizen Community Endorsements",
      points: breakdown.citizen_upvotes || 0,
      max: 10,
      icon: Users,
      desc: "Direct citizen verification through upvotes validates the real-world civic impact on residents.",
      color: "text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-amazon text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-amazon-amber" size={20} />
            <h3 className="font-bold text-base">CivicPulse ML Priority Engine</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Summary Banner */}
        <div className="bg-gradient-to-r from-gray-50 to-amber-50/50 p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Computed Civic Urgency</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">
              Score: <span className="text-[#b12704]">{currentScore || breakdown.total_score || 50}</span> / 100
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-semibold">Priority Tier</div>
            <div className="text-sm font-black text-amazon-darkOrange bg-amber-100 border border-amber-300 px-3 py-1 rounded-md uppercase mt-0.5 inline-block">
              {currentLevel || breakdown.priority_level || 'MEDIUM'}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Factors */}
        <div className="p-5 max-h-[380px] overflow-y-auto space-y-3">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mathematical Component Breakdown</div>
          
          {factors.map((factor) => {
            const Icon = factor.icon;
            const percent = Math.min(100, Math.round((factor.points / factor.max) * 100));

            return (
              <div key={factor.title} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded ${factor.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-gray-800">{factor.title}</span>
                  </div>
                  <span className="text-gray-900 font-mono">+{factor.points} / {factor.max} pts</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-amazon-orange rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="text-[11px] text-gray-500 leading-tight">
                  {factor.desc}
                </div>
              </div>
            );
          })}

          {/* Rationale Bullet Points */}
          {rationale.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-700 mb-2">Automated Audit Trail:</div>
              <ul className="space-y-1.5">
                {rationale.map((r, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <CheckCircle size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="amazon-btn-primary px-5 py-1.5 text-xs font-bold"
          >
            Got it, Close
          </button>
        </div>

      </div>
    </div>
  );
}
