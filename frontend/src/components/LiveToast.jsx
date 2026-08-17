import React, { useContext } from 'react';
import { LiveAlertContext } from '../context/LiveAlertContext';
import { X, Activity, Droplet, Zap, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveToast = () => {
  const { alerts, isConnected, dismissAlert, triggerTestAlert } = useContext(LiveAlertContext);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-w-md w-full px-4 pointer-events-none">
      {/* ACTIVE REAL-TIME SSE TOAST NOTIFICATIONS STACK */}
      {alerts && alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-red-500/40 bg-slate-900/95 text-white flex items-start gap-3 animate-in slide-in-from-right duration-300 transform transition-all w-full"
        >
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 shrink-0">
            {alert.type === 'donor_available' ? (
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <Droplet className="w-5 h-5 text-red-500 fill-current animate-bounce" />
            )}
          </div>

          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wide text-red-400 uppercase">
                {alert.title}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Just Now</span>
            </div>

            <p className="text-xs font-bold text-slate-200 leading-snug">
              {alert.message}
            </p>

            <div className="pt-1 flex items-center gap-3 text-[11px]">
              {alert.type === 'donor_available' ? (
                <Link
                  to="/create-request"
                  className="font-bold text-red-400 hover:text-red-300 underline"
                >
                  Request Blood Now &rarr;
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="font-bold text-brand-400 hover:text-brand-300 underline"
                >
                  View Active Feed &rarr;
                </Link>
              )}
            </div>
          </div>

          <button
            onClick={() => dismissAlert(alert.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* SSE REAL-TIME SIMULATION & STREAM STATUS PILL */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 text-white p-1.5 pr-3 rounded-full border border-slate-700/60 shadow-lg text-[11px] font-bold">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>SSE Live</span>
        </span>
        <button
          onClick={triggerTestAlert}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Test Live Push Alert</span>
        </button>
      </div>
    </div>
  );
};

export default LiveToast;
