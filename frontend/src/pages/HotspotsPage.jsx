import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, AlertTriangle, MapPin, RefreshCw, Layers } from 'lucide-react';
import { api } from '../api/client';
import HotspotMap from '../components/HotspotMap';

export default function HotspotsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({ status: 'All' });
      setComplaints(data);
    } catch (err) {
      console.error("Failed to load hotspots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  const criticalCount = complaints.filter(c => c.priority_level === 'CRITICAL' && c.status !== 'RESOLVED').length;
  const highCount = complaints.filter(c => c.priority_level === 'HIGH' && c.status !== 'RESOLVED').length;

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-6 pb-16">
      
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3">
        <Link to="/" className="text-amazon-link hover:underline">Home</Link> &gt; <span>City Hotspots & GIS Radar</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Flame className="text-red-600 animate-pulse" size={26} />
            <span>Civic Incident Hotspots & Geo-Intelligence</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time spatial mapping using OpenStreetMap and Leaflet to identify recurring civic failure zones and optimize municipal deployment.
          </p>
        </div>

        <button 
          onClick={fetchHotspots}
          className="amazon-btn-outline px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 w-fit"
        >
          <RefreshCw size={14} />
          <span>Refresh Incident Map</span>
        </button>
      </div>

      {/* Top Alert Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-400 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-red-700" />
          </div>
          <div>
            <div className="text-red-700 font-extrabold uppercase text-[10px]">Active Critical Zones</div>
            <div className="text-xl font-black text-red-950 mt-0.5">{criticalCount} Incidents</div>
            <div className="text-[10px] text-red-800">Requires immediate SLA intervention</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-orange-700" />
          </div>
          <div>
            <div className="text-orange-700 font-extrabold uppercase text-[10px]">High Severity Nodes</div>
            <div className="text-xl font-black text-orange-950 mt-0.5">{highCount} Incidents</div>
            <div className="text-[10px] text-orange-800">Field crew dispatch en route</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-400 flex items-center justify-center shrink-0">
            <Layers size={20} className="text-purple-700" />
          </div>
          <div>
            <div className="text-purple-700 font-extrabold uppercase text-[10px]">Spatial Deduplication</div>
            <div className="text-xl font-black text-purple-950 mt-0.5">Active Radar</div>
            <div className="text-[10px] text-purple-800">Clustering complaints within 400m</div>
          </div>
        </div>
      </div>

      {/* Full-Height Hotspot Map */}
      <HotspotMap complaints={complaints} height="650px" />

    </div>
  );
}
