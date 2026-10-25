import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Flame, ShieldAlert, Filter, ChevronRight, Layers } from 'lucide-react';

export default function HotspotMap({ complaints = [], height = "500px" }) {
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Filter complaints
  const filtered = complaints.filter(c => {
    if (filterPriority !== 'All' && c.priority_level !== filterPriority) return false;
    if (filterCategory !== 'All' && (c.manual_category || c.predicted_category) !== filterCategory) return false;
    return true;
  });

  const getMarkerColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { color: '#b12704', fill: '#ef4444', radius: 14 };
      case 'HIGH':
        return { color: '#c2410c', fill: '#f97316', radius: 11 };
      case 'MEDIUM':
        return { color: '#b45309', fill: '#f59e0b', radius: 9 };
      default:
        return { color: '#047857', fill: '#10b981', radius: 8 };
    }
  };

  // Center coordinate calculation
  const defaultCenter = [28.6250, 77.2150];

  return (
    <div className="w-full bg-white border border-[#d5d9d9] rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Top Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-red-600 animate-pulse" />
          <span className="font-bold text-gray-900 text-sm">Geographical Hotspots & Incident Radar</span>
          <span className="bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full text-[11px]">
            {filtered.length} nodes
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1">
            <span className="text-gray-500 font-medium">Priority:</span>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="outline-none bg-transparent font-bold text-gray-800 cursor-pointer text-xs"
            >
              <option value="All">All Tiers</option>
              <option value="CRITICAL">🔴 Critical Only</option>
              <option value="HIGH">🟠 High Only</option>
              <option value="MEDIUM">🟡 Medium Only</option>
              <option value="LOW">🟢 Low Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1">
            <span className="text-gray-500 font-medium">Dept:</span>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="outline-none bg-transparent font-bold text-gray-800 cursor-pointer text-xs max-w-[150px] truncate"
            >
              <option value="All">All Categories</option>
              <option value="Roads & Potholes">Roads & Potholes</option>
              <option value="Waste Management & Garbage">Waste Management</option>
              <option value="Water Supply & Leakage">Water Supply</option>
              <option value="Drainage & Sewage">Drainage & Sewage</option>
              <option value="Streetlights & Electricity">Streetlights</option>
              <option value="Public Health & Sanitation">Public Health</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ height }} className="w-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map((c) => {
            if (!c.latitude || !c.longitude) return null;
            const style = getMarkerColor(c.priority_level);

            return (
              <CircleMarker
                key={c.id}
                center={[c.latitude, c.longitude]}
                radius={style.radius}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fill,
                  fillOpacity: 0.85,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-gray-500">
                      <span>#{c.tracking_number || `CP-${c.id}`}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        c.priority_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.priority_level} ({c.priority_score})
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 leading-snug mb-1">
                      {c.title}
                    </h4>

                    <div className="text-[11px] text-gray-600 mb-2">
                      <p className="truncate">{c.address}</p>
                      <p className="text-gray-400 mt-0.5">{c.manual_category || c.predicted_category}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">
                        {c.status.replace('_', ' ')}
                      </span>
                      <Link 
                        to={`/complaints/${c.id}`}
                        className="text-xs font-bold text-amazon-link hover:underline flex items-center"
                      >
                        Track Issue →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-lg p-2.5 text-[11px] space-y-1">
          <div className="font-bold text-gray-700 mb-1">Priority Density</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700"></span>
            <span>Critical Incident (Immediate SLA)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-700"></span>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-700"></span>
            <span>Medium / Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-700"></span>
            <span>Low / Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
