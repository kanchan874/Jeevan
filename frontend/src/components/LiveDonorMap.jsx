import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { MapPin, Loader2 } from 'lucide-react';

const LiveDonorMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Fetch anonymized donor data
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await api.get('/users/donor-map');
        if (res.data && res.data.success) {
          setDonors(res.data.donors);
        }
      } catch (err) {
        console.error('Failed to load donor map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  // Load Leaflet from CDN and initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) {
          resolve(window.L);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      
      const map = L.map(mapRef.current, {
        center: [13.05, 80.25], // Default: Chennai
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      // Fix map size on load
      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize map tiles on theme change dynamically
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;

    const updateTiles = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      tileLayerRef.current = window.L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    };

    updateTiles();

    const observer = new MutationObserver(() => updateTiles());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [mapReady]);

  // Add markers with tracked cleanup on re-render / unmount
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || donors.length === 0) return;

    const L = window.L;
    if (!L) return;

    // Remove existing markers before creating new ones (prevents memory leaks)
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Create custom blood-drop SVG icon
    const createBloodDropIcon = (bloodGroup, isAvailable, status) => {
      const color = isAvailable ? '#dc2626' : '#94a3b8';
      const opacity = isAvailable ? '1' : '0.5';
      const statusColor = status === 'Eligible' ? '#16a34a' : status === 'Temporarily Deferred' ? '#f59e0b' : '#6b21a8';

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="shadow" x="-25%" y="-15%" width="150%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
            </filter>
          </defs>
          <path d="M18 2 C18 2 4 16 4 26 C4 33.73 10.27 40 18 40 C25.73 40 32 33.73 32 26 C32 16 18 2 18 2Z" fill="${color}" opacity="${opacity}" filter="url(#shadow)" stroke="white" stroke-width="1.5"/>
          <circle cx="18" cy="26" r="8" fill="white"/>
          <text x="18" y="29" text-anchor="middle" fill="${color}" font-size="8" font-weight="900" font-family="Outfit, sans-serif">${bloodGroup}</text>
          <circle cx="28" cy="12" r="4" fill="${statusColor}" stroke="white" stroke-width="1.5"/>
        </svg>
      `;

      return L.divIcon({
        html: svg,
        className: 'blood-drop-marker',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -40]
      });
    };

    const bounds = [];

    donors.forEach((donor) => {
      if (!donor.coordinates || !donor.coordinates.lat || !donor.coordinates.lng) return;

      const icon = createBloodDropIcon(
        donor.bloodGroup || 'O+',
        donor.isAvailable,
        donor.preliminaryStatus
      );

      const statusLabel = donor.preliminaryStatus === 'Eligible'
        ? '<span style="color:#16a34a;font-weight:700">● Eligible</span>'
        : donor.preliminaryStatus === 'Temporarily Deferred'
        ? '<span style="color:#f59e0b;font-weight:700">● Deferred</span>'
        : '<span style="color:#6b21a8;font-weight:700">● Review</span>';

      const availLabel = donor.isAvailable
        ? '<span style="color:#16a34a;font-weight:700">Available Now</span>'
        : '<span style="color:#94a3b8;font-weight:700">Busy</span>';

      const popup = `
        <div style="font-family:Outfit,sans-serif;min-width:160px;padding:4px 0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="background:#dc2626;color:white;font-weight:900;padding:3px 8px;border-radius:8px;font-size:13px">${donor.bloodGroup}</span>
            <span style="font-size:11px;color:#64748b;font-weight:600">${availLabel}</span>
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:3px"><b>Area:</b> ${donor.location || 'Unknown'}</div>
          <div style="font-size:11px;margin-bottom:2px">${statusLabel}</div>
          <div style="font-size:9px;color:#94a3b8;margin-top:6px;font-style:italic">Personal details hidden for donor privacy</div>
        </div>
      `;

      const marker = L.marker([donor.coordinates.lat, donor.coordinates.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popup, {
          closeButton: true,
          maxWidth: 220,
          className: 'blood-popup'
        });

      markersRef.current.push(marker);
      bounds.push([donor.coordinates.lat, donor.coordinates.lng]);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [mapReady, donors]);

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Live Donor Map
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block"></span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Busy</span>
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        Anonymized blood-drop markers showing eligible donor locations. Personal details are not exposed.
      </p>

      {/* Map Container */}
      <div
        className="card-panel overflow-hidden relative"
        style={{ height: '420px', border: '1px solid var(--card-border)' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Loading donor locations...</span>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />
      </div>
    </div>
  );
};

export default LiveDonorMap;
