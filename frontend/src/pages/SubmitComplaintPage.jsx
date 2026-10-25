import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  ThumbsUp, 
  Info,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';

export default function SubmitComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [address, setAddress] = useState('Opposite Metro Station, Outer Ring Road');
  const [ward, setWard] = useState('Central Zone');
  const [manualCategory, setManualCategory] = useState('');

  // AI & Duplicate State
  const [predicting, setPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time AI Debounced Analysis
  useEffect(() => {
    if (title.trim().length < 5 && description.trim().length < 10) {
      setAiPrediction(null);
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setPredicting(true);
      try {
        // 1. Predict category & priority
        const pred = await api.predictCategory(title, description);
        setAiPrediction(pred);

        // 2. Check for duplicates
        const dupRes = await api.checkDuplicates({
          title,
          description,
          latitude,
          longitude,
          category: pred.predicted_category
        });
        setDuplicateMatches(dupRes.candidates || []);
      } catch (err) {
        console.error("AI triage error:", err);
      } finally {
        setPredicting(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, description, latitude, longitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      alert("Please sign in or create a citizen account to submit reports.");
      navigate('/login?redirect=/submit');
      return;
    }

    if (!title.trim() || !description.trim() || !address.trim()) {
      setErrorMsg("Please fill in title, detailed description, and street address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        latitude,
        longitude,
        address: address.trim(),
        ward,
        manual_category: manualCategory || undefined
      });

      // Redirect to the Amazon-style tracking view
      navigate(`/complaints/${created.id}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3">
        <Link to="/" className="text-amazon-link hover:underline">Home</Link> &gt; <span>File New Civic Issue</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form */}
        <div className="flex-1 bg-white border border-[#d5d9d9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Report a Civic Problem</h1>
              <p className="text-xs text-gray-500 mt-1">
                Our machine-learning algorithm classifies your complaint and alerts municipal field units instantly.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-md px-2.5 py-1 text-xs font-bold">
              <Sparkles size={14} className="text-amazon-amber" />
              <span>AI Active</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Title */}
            <div>
              <label className="block font-bold text-gray-800 text-xs mb-1.5">
                Issue Title / Summary <span className="text-red-600">*</span>
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Uncovered open manhole on busy road near Metro Gate 3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber focus:border-amazon-amber"
                required
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Be specific about what is broken or hazardous.
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-gray-800 text-xs mb-1.5">
                Detailed Description <span className="text-red-600">*</span>
              </label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the condition, safety hazard, how long it has been present, and any landmarks..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber focus:border-amazon-amber"
                required
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Keywords like "open manhole", "sparking wire", "burst pipe", or "flooding" will trigger high-priority municipal routing.
              </span>
            </div>

            {/* Manual Category Override Option */}
            <div>
              <label className="block font-bold text-gray-800 text-xs mb-1.5">
                Category (AI Suggests Automatically or select manual)
              </label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber bg-white font-medium"
              >
                <option value="">Let AI Auto-Classify (Recommended)</option>
                <option value="Roads & Potholes">Roads & Potholes</option>
                <option value="Waste Management & Garbage">Waste Management & Garbage</option>
                <option value="Water Supply & Leakage">Water Supply & Leakage</option>
                <option value="Drainage & Sewage">Drainage & Sewage</option>
                <option value="Streetlights & Electricity">Streetlights & Electricity</option>
                <option value="Public Health & Sanitation">Public Health & Sanitation</option>
              </select>
            </div>

            {/* Address & Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-800 text-xs mb-1.5">
                  Street Address / Landmark <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 5th Cross Road, Near Green Park"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 text-xs mb-1.5">
                  Municipal Ward / Zone
                </label>
                <select 
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amazon-amber bg-white font-medium"
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Metro District">North Metro District</option>
                  <option value="East Commercial Zone">East Commercial Zone</option>
                  <option value="South Heritage Zone">South Heritage Zone</option>
                  <option value="West Residential Zone">West Residential Zone</option>
                </select>
              </div>
            </div>

            {/* Interactive Location Picker Map */}
            <div className="pt-2 border-t border-gray-100">
              <LocationPicker 
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                }}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="amazon-btn-primary w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting & Triaging...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Complaint for Municipal Action</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Real-time AI Assistant & Duplicate Radar */}
        <div className="w-full lg:w-96 space-y-5">
          
          {/* AI Intelligence Card */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amazon-amber" />
                <span>Real-Time ML Diagnostics</span>
              </h3>
              {predicting && (
                <span className="text-[10px] text-gray-500 animate-pulse">Analyzing...</span>
              )}
            </div>

            {aiPrediction ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold">Predicted Category:</div>
                  <div className="text-sm font-bold text-amazon-link mt-0.5">
                    {aiPrediction.predicted_category}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Routing to: <strong className="text-gray-800">{aiPrediction.department}</strong>
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-600">Calculated Priority:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      aiPrediction.suggested_priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      aiPrediction.suggested_priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {aiPrediction.suggested_priority} ({aiPrediction.priority_score} pts)
                    </span>
                  </div>
                  
                  {/* Confidence meter */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Model Confidence</span>
                      <span>{Math.round(aiPrediction.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amazon-orange h-full rounded-full"
                        style={{ width: `${Math.round(aiPrediction.confidence * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detected Urgency Keywords */}
                {aiPrediction.priority_breakdown?.rationale && (
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="font-bold text-gray-700">Triage Factors:</div>
                    {aiPrediction.priority_breakdown.rationale.map((r, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-amazon-amber">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-6 text-center">
                Start typing your issue title & description. AI will categorize and determine urgency score automatically.
              </div>
            )}
          </div>

          {/* AI Duplicate Radar */}
          <div className="bg-white border border-[#d5d9d9] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Layers size={16} className="text-purple-600" />
                <span>AI Duplicate Radar</span>
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                Cosine Sim
              </span>
            </div>

            {duplicateMatches.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span>Potential Duplicate Found!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Similar complaints have already been reported nearby. Instead of filing a duplicate, you can endorse an existing report to accelerate resolution!
                  </p>
                </div>

                <div className="space-y-2">
                  {duplicateMatches.map((match) => (
                    <div key={match.complaint_id} className="p-2.5 border border-gray-200 rounded-lg hover:border-gray-300 transition text-xs">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="font-mono">#{match.tracking_number}</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                          {match.similarity_percent}% Match
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">
                        {match.title}
                      </h4>
                      {match.distance_km !== null && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin size={10} />
                          <span>{match.distance_km} km away</span>
                        </div>
                      )}
                      <Link 
                        to={`/complaints/${match.complaint_id}`} 
                        className="amazon-btn-outline w-full py-1 text-center block text-[11px] font-bold"
                      >
                        View & Endorse This Issue →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 py-4 text-center">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1.5" />
                <span>No duplicate reports detected yet for this description and location.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
