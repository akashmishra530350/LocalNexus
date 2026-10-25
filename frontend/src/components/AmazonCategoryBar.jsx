import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Flame, BarChart3, Map, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AmazonCategoryBar({ selectedCategory, onSelectCategory }) {
  const { isOfficial } = useAuth();

  const categories = [
    { label: "Roads & Potholes", val: "Roads & Potholes" },
    { label: "Waste & Sanitation", val: "Waste Management & Garbage" },
    { label: "Water Supply", val: "Water Supply & Leakage" },
    { label: "Drainage & Sewage", val: "Drainage & Sewage" },
    { label: "Streetlights & Power", val: "Streetlights & Electricity" },
    { label: "Public Health", val: "Public Health & Sanitation" }
  ];

  return (
    <nav className="bg-amazon-light text-white text-xs font-medium border-t border-gray-700 overflow-x-auto shadow-inner">
      <div className="max-w-[1500px] mx-auto px-3 py-1.5 flex items-center gap-1 sm:gap-3 whitespace-nowrap scrollbar-none">
        
        {/* "All" button */}
        <button 
          onClick={() => onSelectCategory && onSelectCategory("All")}
          className={`flex items-center gap-1 px-2 py-1 rounded border ${selectedCategory === "All" || !selectedCategory ? "border-amazon-amber text-amazon-amber bg-gray-800" : "border-transparent hover:border-white text-white"} transition font-bold`}
        >
          <Menu size={16} />
          <span>All Departments</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-600"></div>

        {/* Category links */}
        {categories.map((cat) => (
          <button
            key={cat.val}
            onClick={() => onSelectCategory && onSelectCategory(cat.val)}
            className={`px-2 py-1 rounded border transition ${
              selectedCategory === cat.val
                ? "border-amazon-amber text-amazon-amber bg-gray-800 font-bold"
                : "border-transparent hover:border-white text-gray-200 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-gray-600"></div>

        {/* Special feature links */}
        <Link 
          to="/hotspots"
          className="flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-white text-red-300 hover:text-white font-semibold transition"
        >
          <Flame size={14} className="text-red-400 animate-pulse" />
          <span>Hotspot Map</span>
        </Link>

        <Link 
          to="/#analytics-section"
          className="flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-white text-blue-300 hover:text-white transition"
        >
          <BarChart3 size={14} className="text-blue-400" />
          <span>City Analytics</span>
        </Link>

        {isOfficial ? (
          <Link 
            to="/official/dashboard"
            className="ml-auto flex items-center gap-1 bg-amazon-amber text-gray-900 font-bold px-2.5 py-1 rounded border border-amber-400 shadow-sm transition hover:bg-amazon-orange"
          >
            <ShieldCheck size={14} />
            <span>Authority Dispatch Console</span>
          </Link>
        ) : (
          <Link 
            to="/official/login"
            className="ml-auto flex items-center gap-1 text-gray-300 hover:text-white px-2 py-1 border border-transparent hover:border-gray-500 rounded transition"
          >
            <ShieldCheck size={14} className="text-gray-400" />
            <span>Municipal Login →</span>
          </Link>
        )}

      </div>
    </nav>
  );
}
