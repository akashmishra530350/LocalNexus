import React from 'react';
import { Check, Clock, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AmazonTrackingStepper({ complaint }) {
  const steps = [
    { key: 'SUBMITTED', label: 'Reported', sublabel: 'Received via portal' },
    { key: 'UNDER_REVIEW', label: 'AI & Review', sublabel: 'Classified & triaged' },
    { key: 'ASSIGNED', label: 'Assigned', sublabel: complaint.assigned_officer || 'Department dispatched' },
    { key: 'IN_PROGRESS', label: 'Work In Progress', sublabel: 'Crew on site' },
    { key: 'RESOLVED', label: 'Resolved', sublabel: 'Signed off & closed' }
  ];

  const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = statusOrder.indexOf(complaint.status);
  const isRejected = complaint.status === 'REJECTED';

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-900">
        <AlertCircle size={24} className="text-red-600 shrink-0" />
        <div>
          <div className="font-bold text-sm">Complaint Closed / Rejected</div>
          <div className="text-xs text-red-700 mt-0.5">
            {complaint.official_remarks || 'This issue was flagged as invalid or outside municipal jurisdiction.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#d5d9d9] rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking Timeline</span>
          <h4 className="text-base font-bold text-gray-900">
            {complaint.status === 'RESOLVED' ? (
              <span className="text-emerald-700">Delivered & Resolved</span>
            ) : (
              <span>Estimated Resolution: <strong className="text-amazon-amber">{complaint.estimated_resolution_time || 'Within 24-48 Hours'}</strong></span>
            )}
          </h4>
        </div>
        <div className="text-right text-xs text-gray-500">
          Tracking #: <span className="font-mono font-bold text-gray-800">{complaint.tracking_number}</span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="relative flex items-center justify-between w-full mt-6 mb-4">
        {/* Continuous Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Filled Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-amazon-orange -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%` }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || (complaint.status === 'RESOLVED');
          const isCurrent = idx === currentIndex && complaint.status !== 'RESOLVED';

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isDone 
                    ? 'bg-amazon-orange text-white ring-4 ring-orange-100' 
                    : isCurrent 
                      ? 'bg-white border-2 border-amazon-orange text-amazon-orange ring-4 ring-orange-200 animate-pulse' 
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="text-center mt-2 w-20 sm:w-28">
                <div className={`text-xs font-bold leading-tight ${
                  isCurrent ? 'text-amazon-orange' : isDone ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5 hidden sm:block">
                  {step.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
