import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, LocateFixed, MapPin } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface Coords {
  lat: number;
  lng: number;
}

interface DropOffMapPickerProps {
  value: Coords | null;
  fallbackLat: number;
  fallbackLng: number;
  address: string;
  onChange: (coords: Coords) => void;
  onAddressChange: (address: string) => void;
}

function createPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'masar-dropoff-pin-icon',
    html: `
      <div style="position:relative;width:34px;height:42px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 34 42" width="34" height="42" style="filter:drop-shadow(0 4px 8px rgba(5,32,60,0.35));overflow:visible;">
          <path d="M17 1C8.716 1 2 7.716 2 16c0 10.65 13.05 23.45 14.12 24.48a1.25 1.25 0 0 0 1.76 0C18.95 39.45 32 26.65 32 16 32 7.716 25.284 1 17 1z" fill="#0770E3" stroke="#05203C" stroke-width="2"/>
          <circle cx="17" cy="16" r="6" fill="#FFFFFF"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -38],
  });
}

export const DropOffMapPicker: React.FC<DropOffMapPickerProps> = ({
  value,
  fallbackLat,
  fallbackLng,
  address,
  onChange,
  onAddressChange,
}) => {
  const { t } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [locating, setLocating] = useState(false);
  const [geoState, setGeoState] = useState<'idle' | 'locating' | 'located' | 'fallback'>('idle');

  const placePin = useCallback((lat: number, lng: number, zoom?: number) => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (marker) {
      marker.setLatLng([lat, lng]);
    }
    if (map) {
      if (typeof zoom === 'number') {
        map.setView([lat, lng], zoom, { animate: true });
      } else {
        map.panTo([lat, lng], { animate: true });
      }
      map.invalidateSize();
    }
    onChangeRef.current({ lat, lng });
  }, []);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState('fallback');
      setLocating(false);
      return;
    }
    setLocating(true);
    setGeoState('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mapRef.current) return;
        const { latitude, longitude } = pos.coords;
        placePin(latitude, longitude, 15);
        setLocating(false);
        setGeoState('located');
      },
      () => {
        if (!mapRef.current) return;
        setLocating(false);
        setGeoState('fallback');
        mapRef.current.invalidateSize();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [placePin]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const startLat = value?.lat ?? fallbackLat;
    const startLng = value?.lng ?? fallbackLng;

    const map = L.map(container, {
      center: [startLat, startLng],
      zoom: 13,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: createPinIcon(),
    }).addTo(map);
    markerRef.current = marker;

    // Ensure fallback coordinate is recorded immediately while GPS resolves
    if (!value) {
      onChangeRef.current({ lat: startLat, lng: startLng });
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChangeRef.current({ lat, lng });
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChangeRef.current({ lat: pos.lat, lng: pos.lng });
    });

    // Redraw cleanly after initial mount and modal transition
    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t1 = window.setTimeout(() => map.invalidateSize(), 150);
    const t2 = window.setTimeout(() => map.invalidateSize(), 420);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    // Immediately request browser geolocation when map view opens
    locateUser();

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Mount once per DropOffMapPicker open lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLat = value?.lat ?? fallbackLat;
  const currentLng = value?.lng ?? fallbackLng;

  return (
    <div className="space-y-3 rounded-xl border border-[#CBD5E1] bg-[#F7F9FB] p-3.5">
      {/* Top Status & Re-center Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {geoState === 'locating' || locating ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#05203C] text-white text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>{t.booking.locatingMap}</span>
            </span>
          ) : geoState === 'located' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#0770E3] text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{t.booking.locatedSuccess}</span>
            </span>
          ) : geoState === 'fallback' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{t.booking.locateFallbackNotice}</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#05203C]">{t.booking.tapOrDragPinHint}</span>
          )}
        </div>

        <button
          type="button"
          onClick={locateUser}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#05203C] hover:border-[#0770E3] hover:text-[#0770E3] disabled:opacity-60 cursor-pointer transition-colors shrink-0"
        >
          <LocateFixed className="w-3.5 h-3.5 text-[#0770E3]" />
          <span>{t.booking.recenterMyLocation}</span>
        </button>
      </div>

      {/* Explicit-Height Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-[#CBD5E1] bg-slate-100">
        <div
          ref={mapContainerRef}
          className="w-full h-[280px] sm:h-[300px] z-0"
          style={{ height: 290, width: '100%' }}
        />
      </div>

      {/* Coordinates + Hint + Address Landmark */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <span>{t.booking.tapOrDragPinHint}</span>
          <span className="font-mono font-semibold text-[#05203C] tabular-nums" dir="ltr">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.booking.customDropOffAddressLabel}
          </label>
          <input
            type="text"
            maxLength={240}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t.booking.customDropOffAddressPlaceholder}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0770E3]"
          />
        </div>
      </div>
    </div>
  );
};
