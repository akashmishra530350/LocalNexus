import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  ShieldAlert, 
  FilePlus2, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AmazonNavbar({ onSearch, selectedCategory, onSelectCategory }) {
  const { user, isOfficial, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeZone, setActiveZone] = useState('Central Zone 110001');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const categories = [
    "All",
    "Roads & Potholes",
    "Waste Management & Garbage",
    "Water Supply & Leakage",
    "Drainage & Sewage",
    "Streetlights & Electricity",
    "Public Health & Sanitation"
  ];

  return (
    <header className="bg-amazon text-white sticky top-0 z-50 shadow-md">
      {/* Top Navbar */}
      <div className="max-w-[1500px] mx-auto px-3 py-2 flex items-center justify-between gap-3 text-sm">
        
        {/* 1. CivicPulse Amazon-style Logo */}
        <Link to="/" className="flex items-center gap-1.5 p-1 border border-transparent hover:border-white rounded cursor-pointer transition">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-white">civic<span className="text-amazon-amber">pulse</span></span>
              <span className="text-[10px] text-gray-300 ml-1 font-semibold">.city</span>
            </div>
            {/* Amazon orange smile / pulse curve */}
            <div className="w-full flex items-center -mt-1">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amazon-amber to-amazon-orange rounded-full"></div>
            </div>
          </div>
        </Link>

        {/* 2. Deliver To / Ward Location Selector */}
        <div 
          onClick={() => {
            const nextZone = activeZone.includes('Central') ? 'North Metro Ward 110007' : 'Central Zone 110001';
            setActiveZone(nextZone);
          }}
          className="hidden sm:flex items-center gap-1 p-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight text-left transition select-none"
          title="Click to toggle municipal jurisdiction zone"
        >
          <MapPin size={18} className="text-amazon-amber mt-1 shrink-0" />
          <div>
            <div className="text-[11px] text-gray-300">Monitored Ward</div>
            <div className="text-xs font-bold text-white flex items-center gap-0.5 whitespace-nowrap">
              {activeZone}
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* 3. Central Search Bar with Category Dropdown */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center max-w-3xl h-10 rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amazon-amber">
          <select 
            value={selectedCategory || "All"}
            onChange={(e) => onSelectCategory && onSelectCategory(e.target.value)}
            className="h-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2.5 border-r border-gray-300 font-medium cursor-pointer outline-none max-w-[130px] truncate"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search civic issues, tracking # (e.g. CP-2026-...), address, or potholes..."
            className="flex-1 px-3 py-2 text-sm text-gray-900 outline-none placeholder-gray-500 w-full"
          />

          <button 
            type="submit" 
            className="h-full bg-amazon-accent hover:bg-amazon-amber active:bg-amazon-orange px-4 flex items-center justify-center transition-colors text-amazon"
            title="Search Civic Complaints"
          >
            <Search size={20} className="text-gray-900 stroke-[2.5]" />
          </button>
        </form>

        {/* 4. Right Utility Icons & Account Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* User / Official Account Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="p-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight text-left flex items-center gap-1 transition"
            >
              <div>
                <div className="text-[11px] text-gray-300">
                  {user ? `Hello, ${user.full_name.split(' ')[0]}` : 'Hello, Sign In'}
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-0.5">
                  {isOfficial ? 'Official Desk' : (user ? 'Citizen Account' : 'Sign In & Portals')}
                  <ChevronDown size={12} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-md shadow-2xl border border-gray-200 py-3 px-4 z-50 text-xs"
                onMouseLeave={() => setShowAccountMenu(false)}
              >
                {!user ? (
                  <div className="flex flex-col gap-2 pb-3 border-b border-gray-200">
                    <Link 
                      to="/login"
                      onClick={() => setShowAccountMenu(false)}
                      className="amazon-btn-primary w-full py-2 text-center text-xs font-bold"
                    >
                      Citizen Sign In
                    </Link>
                    <div className="text-center text-[11px] text-gray-600">
                      New citizen? <Link to="/login?tab=register" onClick={() => setShowAccountMenu(false)} className="text-amazon-link hover:underline font-semibold">Start here.</Link>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Municipal Staff</div>
                      <Link 
                        to="/official/login"
                        onClick={() => setShowAccountMenu(false)}
                        className="amazon-btn-dark w-full py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert size={14} className="text-amazon-amber" />
                        Municipal Authority Portal
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pb-2 border-b border-gray-200">
                    <div className="font-bold text-gray-900 text-sm">{user.full_name}</div>
                    <div className="text-[11px] text-gray-500">{user.email}</div>
                    <div className="inline-block bg-amber-50 text-amber-800 border border-amber-200 rounded px-2 py-0.5 text-[10px] font-semibold uppercase w-fit">
                      {user.role} {user.department ? `• ${user.department}` : ''}
                    </div>
                  </div>
                )}

                {/* Navigation Links in Account dropdown */}
                <div className="pt-2 flex flex-col gap-1">
                  <Link 
                    to="/my-reports" 
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-100 rounded text-gray-700 hover:text-black font-medium"
                  >
                    <ClipboardList size={15} className="text-gray-500" />
                    Your Filed Reports (Amazon Orders Style)
                  </Link>

                  {isOfficial && (
                    <Link 
                      to="/official/dashboard" 
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-amber-900 font-semibold"
                    >
                      <LayoutDashboard size={15} className="text-amazon-amber" />
                      Municipal Authority Console
                    </Link>
                  )}

                  <Link 
                    to="/hotspots" 
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-100 rounded text-gray-700 hover:text-black font-medium"
                  >
                    <MapPin size={15} className="text-red-500" />
                    City Hotspot Map & Heatmaps
                  </Link>

                  {user && (
                    <button 
                      onClick={() => {
                        logout();
                        setShowAccountMenu(false);
                        navigate('/');
                      }}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-red-50 rounded text-red-600 font-medium text-left mt-1 border-t border-gray-100 pt-2"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Returns & Reports (Amazon "Returns & Orders") */}
          <Link 
            to="/my-reports" 
            className="hidden md:flex flex-col p-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight transition text-left"
          >
            <span className="text-[11px] text-gray-300">Track Status</span>
            <span className="text-xs font-bold text-white whitespace-nowrap">& Reports</span>
          </Link>

          {/* Official Authority Portal Quick Pill */}
          <Link 
            to={isOfficial ? "/official/dashboard" : "/official/login"}
            className="hidden lg:flex items-center gap-1.5 bg-[#232f3e] hover:bg-[#37475a] border border-gray-600 px-2.5 py-1.5 rounded text-xs font-semibold text-amazon-amber transition"
            title="Separate portal for Municipal Authorities & Field Engineers"
          >
            <ShieldAlert size={14} className="text-amazon-amber" />
            <span>Official Portal</span>
          </Link>

          {/* Report Issue (Amazon Cart-style Action) */}
          <Link 
            to="/submit" 
            className="flex items-center gap-1.5 bg-amazon-amber hover:bg-amazon-orange text-gray-950 font-bold px-3 py-1.5 rounded-md border border-amber-500 shadow transition transform hover:scale-[1.02]"
          >
            <div className="relative">
              <FilePlus2 size={20} className="stroke-[2.5]" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-[10px] uppercase font-extrabold text-gray-800">Quick File</div>
              <div className="text-xs font-black">Report Issue</div>
            </div>
          </Link>

        </div>

      </div>
    </header>
  );
}
