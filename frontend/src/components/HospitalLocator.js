import React, { useState, useRef } from "react";
import { MapPin, Navigation, Phone, ExternalLink, AlertCircle, Building2, Pill } from "lucide-react";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";
const PLACE_TYPES = [
  { label: "Hospitals", key: "hospital", icon: Building2 },
  { label: "Pharmacies", key: "pharmacy", icon: Pill },
  { label: "Clinics", key: "clinic", icon: Building2 },
];
const PRESET_RADII = [1, 2, 5, 10, 20];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) * Math.sin(dL / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dl / 2) *
      Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HospitalLocator() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState("hospital");
  const [radiusKm, setRadiusKm] = useState(5);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const loadLeaflet = () =>
    new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });

  const setupMap = (lat, lng) => {
    if (!mapRef.current || !window.L) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }
    const map = window.L.map(mapRef.current).setView([lat, lng], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    window.L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: "#111111",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup("<b>📍 Current Position</b>");

    mapInstanceRef.current = map;
  };

  const addMarkers = (results) => {
    if (!mapInstanceRef.current || !window.L) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    results.forEach((p) => {
      const icon = window.L.divIcon({
        html: `<div style="background:#8C907E;color:white;padding:4px 8px;font-size:11px;font-weight:600;letter-spacing:0.05em;border:1px solid #111;box-shadow:0 2px 6px rgba(0,0,0,0.15)">${
          p.type === "pharmacy" ? "💊" : "🏥"
        }</div>`,
        className: "",
        iconAnchor: [14, 14],
      });
      const marker = window.L.marker([p.lat, p.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<b>${p.name}</b><br/>${p.address ? `📍 ${p.address}<br/>` : ""}${
            p.phone ? `📞 ${p.phone}<br/>` : ""
          }<span style="color:#8C907E;font-weight:bold">${p.distance.toFixed(
            1
          )} km away</span>`
        );
      markersRef.current.push(marker);
    });
  };

  const fetchPlaces = async (lat, lng, type, rad) => {
    setLoading(true);
    setError(null);
    setPlaces([]);
    try {
      const radMeters = rad * 1000;
      const query = `[out:json][timeout:30];(node["amenity"="${type}"](around:${radMeters},${lat},${lng});way["amenity"="${type}"](around:${radMeters},${lat},${lng}););out body center;`;
      const res = await fetch(OVERPASS_API, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await res.json();
      const results = (data.elements || [])
        .map((el) => {
          const elLat = el.lat || el.center?.lat;
          const elLng = el.lon || el.center?.lon;
          if (!elLat || !elLng) return null;
          return {
            id: el.id,
            name: el.tags?.name || `Unnamed ${type}`,
            lat: elLat,
            lng: elLng,
            address:
              el.tags?.["addr:street"] ||
              el.tags?.["addr:full"] ||
              el.tags?.amenity ||
              "",
            phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
            type: type,
            distance: getDistance(lat, lng, elLat, elLng),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      setPlaces(results);
      addMarkers(results);
    } catch (err) {
      setError("Failed to fetch medical facilities. Overpass service may be busy.");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your current browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        await loadLeaflet();
        setupMap(latitude, longitude);
        fetchPlaces(latitude, longitude, activeType, radiusKm);
      },
      (err) => {
        setLoading(false);
        setError("Unable to obtain your location. Please ensure location permissions are granted.");
      },
      { timeout: 15000 }
    );
  };

  const handleTypeChange = (newType) => {
    setActiveType(newType);
    if (location) {
      fetchPlaces(location.lat, location.lng, newType, radiusKm);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    if (location) {
      fetchPlaces(location.lat, location.lng, activeType, newRadius);
    }
  };

  return (
    <div className="kaira-card bg-white border border-[#EAE8E2] p-6 sm:p-10 shadow-kaira space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F1F1F0] gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] flex items-center justify-center text-[#8C907E]">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[#111111] font-normal">
              Medical Facility & Emergency Locator
            </h3>
            <p className="text-xs text-[#606456] mt-0.5">
              Instant geolocation of hospitals, outpatient clinics, and certified pharmacies
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={getUserLocation}
          className="btn-kaira-dark text-xs !py-3 !px-6 flex items-center gap-2 self-start sm:self-auto"
        >
          <Navigation className="w-4 h-4" />
          <span>{location ? "Refresh Location" : "Detect Current Location"}</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[#FAF9F6] border border-[#EAE8E2]">
        {/* Facility Types */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#8A8D83] font-semibold mr-1">
            Facility:
          </span>
          {PLACE_TYPES.map((t) => {
            const active = activeType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTypeChange(t.key)}
                className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  active
                    ? "bg-[#111111] border-[#111111] text-white font-medium"
                    : "bg-white border-[#EAE8E2] text-[#606456] hover:border-[#8C907E]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Radius presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#8A8D83] font-semibold mr-1">
            Search Radius:
          </span>
          {PRESET_RADII.map((r) => {
            const active = radiusKm === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRadiusChange(r)}
                className={`text-xs px-2.5 py-1 border transition-all ${
                  active
                    ? "bg-[#8C907E] border-[#8C907E] text-white font-semibold"
                    : "bg-white border-[#EAE8E2] text-[#606456] hover:border-[#8C907E]"
                }`}
              >
                {r} km
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative border border-[#EAE8E2] overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-80 sm:h-96 bg-[#F1F1F0] z-0"
        />
        {!location && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <Navigation className="w-10 h-10 text-[#8C907E] mb-3 animate-pulse" />
            <h4 className="font-serif text-xl text-[#111111]">Location Access Required</h4>
            <p className="text-xs text-[#606456] mt-1 max-w-sm mb-4">
              Click below to grant geolocation permission and locate medical infrastructure near you.
            </p>
            <button
              type="button"
              onClick={getUserLocation}
              className="btn-kaira-dark text-xs !py-2.5 !px-6"
            >
              Locate Nearby Facilities
            </button>
          </div>
        )}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-12 text-center text-xs uppercase tracking-wider text-[#8A8D83]">
          Scanning verified medical registries within {radiusKm}km...
        </div>
      ) : places.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F1F0]">
            <h4 className="font-serif text-xl text-[#111111]">
              Discovered Facilities ({places.length})
            </h4>
            <span className="text-xs uppercase tracking-wider text-[#8A8D83]">
              Sorted by proximity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-5 border border-[#EAE8E2] bg-[#FAF9F6] hover:border-[#111111] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="font-serif text-base text-[#111111] font-medium">
                      {place.name}
                    </h5>
                    <span className="text-xs font-semibold text-[#8C907E] uppercase tracking-wider bg-white px-2 py-0.5 border border-[#EAE8E2] flex-shrink-0">
                      {place.distance.toFixed(1)} km
                    </span>
                  </div>

                  {place.address && (
                    <p className="text-xs text-[#606456] mb-1.5 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8A8D83] mt-0.5 flex-shrink-0" />
                      <span>{place.address}</span>
                    </p>
                  )}

                  {place.phone && (
                    <p className="text-xs text-[#606456] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#8A8D83]" />
                      <a href={`tel:${place.phone}`} className="hover:text-[#111111] underline">
                        {place.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-[#EAE8E2]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#8A8D83]">
                    {place.type}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] hover:text-[#8C907E] font-medium flex items-center gap-1 tracking-wider uppercase text-[11px]"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : location && !loading ? (
        <div className="py-10 text-center text-[#8A8D83] bg-[#FAF9F6] border border-[#EAE8E2]">
          <Building2 className="w-8 h-8 mx-auto text-[#D3D7C9] mb-2" />
          <p className="font-serif text-lg text-[#111111]">No {activeType}s found within {radiusKm}km</p>
          <p className="text-xs mt-1">Try expanding the search radius using the controls above.</p>
        </div>
      ) : null}
    </div>
  );
}
