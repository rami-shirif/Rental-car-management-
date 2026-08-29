import { useState } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import { updateCarGPS } from '../lib/data';

function formatCoord(value, posLabel, negLabel) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const dir = value >= 0 ? posLabel : negLabel;
  return `${Math.abs(value).toFixed(5)}° ${dir}`;
}

function relativeTime(ts) {
  if (!ts) return null;
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export default function CarGPS({ car }) {
  const [locating, setLocating] = useState(false);
  const gps = car.gps || {};
  const hasFix = gps.lat != null && gps.lng != null;
  const isStale = hasFix && Date.now() - (gps.updatedAt || 0) > 1000 * 60 * 60 * 6; // 6h

  const locateNow = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateCarGPS(car.id, pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="gps-readout">
      <div className="gps-readout-head">
        <span className={`gps-dot ${isStale || !hasFix ? 'stale' : ''}`} />
        GPS location {hasFix && `· ${relativeTime(gps.updatedAt)}`}
      </div>
      {hasFix ? (
        <div className="gps-coords">
          <span>
            {formatCoord(gps.lat, 'N', 'S')}, {formatCoord(gps.lng, 'E', 'W')}
          </span>
          <a
            className="gps-link"
            href={`https://maps.google.com/?q=${gps.lat},${gps.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={13} style={{ verticalAlign: -2 }} /> Map
          </a>
        </div>
      ) : (
        <div className="gps-coords">
          <span className="gps-none">No fix reported yet</span>
          <button className="btn btn-ghost icon-btn" onClick={locateNow} disabled={locating}>
            <Crosshair size={13} /> {locating ? 'Locating…' : 'Set from this device'}
          </button>
        </div>
      )}
    </div>
  );
}
