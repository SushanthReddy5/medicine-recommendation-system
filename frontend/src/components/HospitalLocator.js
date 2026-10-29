import { useState, useRef } from "react";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";
const PLACE_TYPES  = [
  { label: "🏥 Hospitals",  key: "hospital" },
  { label: "💊 Pharmacies", key: "pharmacy" },
  { label: "🏨 Clinics",    key: "clinic"   },
];
const PRESET_RADII = [1, 2, 5, 10, 20];

function getDistance(lat1, lon1, lat2, lon2) {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a  = Math.sin(dL/2)*Math.sin(dL/2) + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dl/2)*Math.sin(dl/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function HospitalLocator() {
  const [location, setLocation]     = useState(null);
  const [places, setPlaces]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [activeType, setActiveType] = useState("hospital");
  const [radiusKm, setRadiusKm]     = useState(2);
  const [customKm, setCustomKm]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);

  const getRadiusMeters = () => {
    if (useCustom && customKm) return Math.min(parseInt(customKm) * 1000, 50000);
    return radiusKm * 1000;
  };
  const getRadiusLabel = () => {
    if (useCustom && customKm) return `${customKm}km`;
    return `${radiusKm}km`;
  };

  const loadLeaflet = () => new Promise(resolve => {
    if (window.L) { resolve(); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
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
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); }
    const map = window.L.map(mapRef.current).setView([lat, lng], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    window.L.circleMarker([lat, lng], {
      radius: 8, fillColor: "#3b82f6", color: "#fff", weight: 2, fillOpacity: 1,
    }).addTo(map).bindPopup("📍 Your Location");
    mapInstanceRef.current = map;
  };

  const addMarkers = (results) => {
    if (!mapInstanceRef.current || !window.L) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    results.forEach(p => {
      const icon = window.L.divIcon({
        html: `<div style="background:#ef4444;color:white;padding:3px 8px;border-radius:6px;font-size:13px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${p.type === "pharmacy" ? "💊" : p.type === "clinic" ? "🏨" : "🏥"}</div>`,
        className: "", iconAnchor: [14, 14],
      });
      const marker = window.L.marker([p.lat, p.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${p.name}</b><br/>${p.address ? `📍 ${p.address}<br/>` : ""}${p.phone ? `📞 ${p.phone}<br/>` : ""}<span style="color:#3b82f6;font-weight:bold">${p.distance.toFixed(1)} km away</span>`);
      markersRef.current.push(marker);
    });
  };

  const fetchPlaces = async (lat, lng, type, rad) => {
    setLoading(true); setError(null); setPlaces([]);
    try {
      const query = `[out:json][timeout:30];(node["amenity"="${type}"](around:${rad},${lat},${lng});way["amenity"="${type}"](around:${rad},${lat},${lng}););out body center;`;
      const res  = await fetch(OVERPASS_API, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await res.json();
      const results = (data.elements || [])
        .map(el => {
          const elLat = el.lat || el.center?.lat;
          const elLng = el.lon  || el.center?.lon;
          if (!elLat || !elLng) return null;
          return {
            id: el.id,
            name: el.tags?.name || `Unnamed ${type}`,
            address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", "),
            phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
            lat: elLat, lng: elLng, type,
            distance: getDistance(lat, lng, elLat, elLng),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);
      setPlaces(results);
      setTimeout(() => addMarkers(results), 300);
    } catch (e) {
      setError("Failed to fetch nearby places. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const rad = getRadiusMeters();
    if (location) { fetchPlaces(location.lat, location.lng, activeType, rad); return; }
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLoading(true); setError(null);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        await loadLeaflet();
        setTimeout(() => setupMap(lat, lng), 200);
        fetchPlaces(lat, lng, activeType, rad);
      },
      () => { setLoading(false); setError("Could not get location. Please allow location access."); }
    );
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    if (location) fetchPlaces(location.lat, location.lng, type, getRadiusMeters());
  };

  const activeClass   = "bg-blue-600 border-blue-500 text-white";
  const inactiveClass = "bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500";
  const activeRClass  = "bg-blue-600 border-blue-500 text-white";
  const inactiveRClass = "bg-slate-900 border-slate-600 text-slate-400 hover:border-blue-500";

  return (
    <div className="space-y-5">

      {/* Type tabs */}
      <div className="flex gap-2">
        {PLACE_TYPES.map(pt => (
          <button key={pt.key} onClick={() => handleTypeChange(pt.key)}
                  className={`flex-1 text-sm py-3 px-4 rounded-xl border font-medium transition-colors ${activeType === pt.key ? activeClass : inactiveClass}`}>
            {pt.label}
          </button>
        ))}
      </div>

      {/* Radius */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-300 mb-3">Search Radius</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {PRESET_RADII.map(r => (
            <button key={r} onClick={() => { setRadiusKm(r); setUseCustom(false); }}
                    className={`text-sm px-4 py-2 rounded-xl border transition-colors ${!useCustom && radiusKm === r ? activeRClass : inactiveRClass}`}>
              {r} km
            </button>
          ))}
          <button onClick={() => setUseCustom(!useCustom)}
                  className={`text-sm px-4 py-2 rounded-xl border transition-colors ${useCustom ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-600 text-slate-400 hover:border-purple-500"}`}>
            ✏️ Custom
          </button>
        </div>

        {useCustom && (
          <div className="flex items-center gap-3 mt-2">
            <input type="number" value={customKm}
                   onChange={e => setCustomKm(e.target.value)}
                   onKeyDown={e => e.key === "Enter" && handleSearch()}
                   placeholder="Enter km e.g. 15"
                   min="1" max="50"
                   className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-purple-500 placeholder-slate-500"/>
            <span className="text-slate-400 text-sm font-medium">km</span>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-3">
          Searching within <strong className="text-blue-400">{getRadiusLabel()}</strong> of your location
          {getRadiusMeters() >= 10000 && <span className="text-yellow-500 ml-1">· Large radius may take longer</span>}
        </p>
      </div>

      {/* Search button */}
      <button onClick={handleSearch} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl transition-colors text-base">
        {loading ? "🔄 Searching..." : location ? `🔄 Search ${getRadiusLabel()} for ${activeType}s` : `📍 Find Nearby ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}s`}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Map */}
      {location && (
        <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-slate-700" style={{ height: "320px" }}/>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-slate-400">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Searching within {getRadiusLabel()}...
        </div>
      )}

      {/* Results */}
      {places.length > 0 && (
        <div>
          <p className="text-sm text-slate-400 mb-3">
            Found <strong className="text-white">{places.length}</strong> places within <strong className="text-blue-400">{getRadiusLabel()}</strong>
          </p>
          <div className="space-y-3">
            {places.map(place => (
              <div key={place.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate">
                      {place.type === "pharmacy" ? "💊" : place.type === "clinic" ? "🏨" : "🏥"} {place.name}
                    </p>
                    {place.address && <p className="text-slate-500 text-sm mt-1 truncate">📍 {place.address}</p>}
                    {place.phone && (
                      <p className="text-slate-400 text-sm mt-0.5">
                        📞 <a href={`tel:${place.phone}`} className="hover:text-blue-400 transition-colors">{place.phone}</a>
                      </p>
                    )}
                    <p className="text-blue-400 text-sm mt-1 font-medium">📏 {place.distance.toFixed(1)} km away</p>
                  </div>
                  <button onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}&zoom=17`, "_blank")}
                          className="bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">
                    View Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {location && !loading && places.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>No places found within {getRadiusLabel()}.</p>
          <p className="text-sm mt-1">Try increasing the search radius.</p>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">
        Powered by OpenStreetMap
      </p>
    </div>
  );
}
