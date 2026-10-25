import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle } from 'lucide-react';

const COLORS = ['#ff9900', '#007185', '#b12704', '#067d62', '#8b5cf6', '#f59e0b'];
const STATUS_COLORS = {
  SUBMITTED: '#6b7280',
  UNDER_REVIEW: '#f59e0b',
  ASSIGNED: '#8b5cf6',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444'
};

export default function AnalyticsCharts({ analytics }) {
  if (!analytics) return null;

  // Prepare Category Data
  const categoryData = Object.entries(analytics.category_counts || {}).map(([name, count]) => ({
    name: name.replace(' & ', '\n& '),
    shortName: name.split(' ')[0],
    count
  }));

  // Prepare Status Data
  const statusData = Object.entries(analytics.status_counts || {})
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.replace('_', ' '),
      statusKey: status,
      value: count
    }));

  // Trend Data
  const trendData = analytics.recent_trend || [];

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Total Logged</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{analytics.total_complaints}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Across all wards</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block"></span>
            Critical Triage
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">{analytics.critical_complaints}</div>
          <div className="text-[10px] text-red-500 mt-0.5">Urgent SLA dispatch</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Pending Review</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{analytics.pending_complaints}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Awaiting triage</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">In Progress</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{analytics.in_progress_complaints}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Field crew deployed</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Resolved</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{analytics.resolved_complaints}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Verified & closed</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">AI Deduplicated</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{analytics.duplicates_flagged || 2}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Saved municipal triage</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Categories Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#d5d9d9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-amazon-amber" />
              <span>Complaints by Department Category</span>
            </h4>
            <span className="text-xs text-gray-400 font-medium">ML Classified</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d5d9d9', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#ff9900" radius={[4, 4, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Lifecycle Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#d5d9d9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <PieIcon size={16} className="text-amazon-link" />
              <span>Complaint Resolution Lifecycle Status</span>
            </h4>
            <span className="text-xs text-gray-400 font-medium">Real-time pipeline</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.statusKey] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d5d9d9', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weekly Activity Velocity Trend */}
        <div className="bg-white p-5 rounded-xl border border-[#d5d9d9] shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-600" />
              <span>7-Day Intake vs Resolution Velocity</span>
            </h4>
            <span className="text-xs text-gray-500">
              Avg Resolution Time: <strong>{analytics.average_resolution_hours} Hours</strong>
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9900" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff9900" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d5d9d9', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="reported" stroke="#ff9900" fillOpacity={1} fill="url(#colorReported)" name="Reported Complaints" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved Issues" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
