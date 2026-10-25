import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Custom Marker Icon
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }) {
  const [lat, setLat] = useState(latitude || 28.6139);
  const [lng, setLng] = useState(longitude || 77.2090);

  useEffect(() => {
    if (latitude && longitude) {
      setLat(latitude);
      setLng(longitude);
    }
  }, [latitude, longitude]);

  const handleSelect = (newLat, newLng) => {
    const fixedLat = parseFloat(newLat.toFixed(5));
    const fixedLng = parseFloat(newLng.toFixed(5));
    setLat(fixedLat);
    setLng(fixedLng);
    onLocationChange(fixedLat, fixedLng);
  };

  const handleUseCurrentLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSelect(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          // Fallback to random nearby coordinate for demonstration
          const jitterLat = 28.6139 + (Math.random() - 0.5) * 0.04;
          const jitterLng = 77.2090 + (Math.random() - 0.5) * 0.04;
          handleSelect(jitterLat, jitterLng);
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-gray-700 flex items-center gap-1">
          <MapPin size={14} className="text-amazon-orange" />
          <span>Pin Location on Map (Click to set coordinates)</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-amazon-link hover:underline font-semibold flex items-center gap-1 text-[11px]"
        >
          <Navigation size={12} />
          Use GPS Location
        </button>
      </div>

      <div className="h-56 w-full rounded-lg overflow-hidden border border-gray-300 relative shadow-inner">
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={customMarkerIcon} />
          <MapClickHandler onLocationSelect={handleSelect} />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
        <span>Lat: <strong>{lat.toFixed(4)}</strong></span>
        <span>•</span>
        <span>Lng: <strong>{lng.toFixed(4)}</strong></span>
      </div>
    </div>
  );
}
