import React from 'react';
import { MessageSquare, MapPin, Navigation, Clock, Sparkles } from 'lucide-react';

const DonorCard = ({ donor }) => {
  const { name, bloodGroup, location, distance, lastAvailableChangedAt, whatsappLink, mapLink, aiMatchScore } = donor;
  const isExtremelyClose = distance <= 5.0;

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`card-panel p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
        isExtremelyClose ? 'ring-2 ring-brand-500/20' : ''
      }`}
      style={{ border: '1px solid var(--card-border)' }}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text-heading)' }}>{name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-semibold truncate max-w-[190px]" style={{ color: 'var(--text-muted)' }} title={location}>{location}</span>
          </div>
        </div>
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-brand-600 font-black text-lg" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
          {bloodGroup}
        </span>
      </div>

      {/* CONTENT */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center rounded-xl px-3 py-2" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Proximity</span>
          <span className={`text-xs font-bold tracking-wide ${isExtremelyClose ? 'text-brand-600' : ''}`} style={isExtremelyClose ? {} : { color: 'var(--text-heading)' }}>
            {distance} km {isExtremelyClose && '• Close By'}
          </span>
        </div>

        {aiMatchScore != null && (
          <div className="flex justify-between items-center rounded-xl px-3 py-2" style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.1)' }}>
            <span className="text-[11px] font-semibold flex items-center gap-1 text-brand-600">
              <Sparkles className="w-3 h-3" /> AI Match Score
            </span>
            <span className="text-xs font-black text-brand-600">{aiMatchScore}%</span>
          </div>
        )}

        {lastAvailableChangedAt && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold px-1" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>Active since: {formatTime(lastAvailableChangedAt)}</span>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-2.5">
        <a href={mapLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all"
          style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
          <Navigation className="w-3.5 h-3.5 text-sky-500" /><span>Google Map</span>
        </a>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl transition-all shadow-sm">
          <MessageSquare className="w-3.5 h-3.5 fill-current" /><span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default DonorCard;
