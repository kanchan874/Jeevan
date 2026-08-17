import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, MapPin, Calendar, Clock, CheckCircle2, PhoneCall, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../services/api';
import DonationImpactCard from '../components/DonationImpactCard';
import { LanguageContext } from '../context/LanguageContext';

const MyDonations = () => {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    committed: 0,
    contacted: 0,
    confirmed: 0,
    donated: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchDonationActivities();
  }, []);

  const fetchDonationActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my-donations');
      if (res.data && res.data.success) {
        setActivities(res.data.activities || []);
        setCounts(res.data.counts || {
          all: 0,
          committed: 0,
          contacted: 0,
          confirmed: 0,
          donated: 0,
          cancelled: 0
        });
      }
    } catch (err) {
      console.error('Failed to load donation activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'All', label: `All (${counts.all || 0})` },
    { key: 'Committed', label: `Committed (${counts.committed || 0})` },
    { key: 'Contacted', label: `Contacted (${counts.contacted || 0})` },
    { key: 'Confirmed', label: `Confirmed (${counts.confirmed || 0})` },
    { key: 'Donated', label: `Donated (${counts.donated || 0})` },
    { key: 'Cancelled', label: `Cancelled (${counts.cancelled || 0})` }
  ];

  const filteredActivities = activities.filter((act) => {
    if (activeTab === 'All') return true;
    return act.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen pb-16">
      {/* RESPONSIVE WEBSITE HERO HEADER */}
      <div className="bg-gradient-to-r from-red-600 via-brand-600 to-red-700 text-white py-8 px-6 shadow-md border-b border-red-700/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('donations_page_title')}</h1>
              <p className="text-xs md:text-sm text-red-100 font-medium mt-1">
                {t('donations_page_sub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/create-request')}
              className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-red-600" />
              <span>Create Blood Request</span>
            </button>
          </div>
        </div>

        {/* HORIZONTAL FILTER TABS */}
        <div className="max-w-6xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-red-600 shadow-md'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FULL RESPONSIVE CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 space-y-8">
        <DonationImpactCard />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
            <p className="text-xs font-semibold text-slate-500">Loading donation activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          /* EMPTY STATE */
          <div className="card-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-5 my-8" style={{ border: '1px solid var(--card-border)' }}>
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-500 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('donations_no_activities')}
              </h3>
              <p className="text-xs max-w-xs leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
                {t('donations_no_activities_sub')}
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-red-600/30 transition-all cursor-pointer text-xs"
            >
              <Search className="w-4 h-4" />
              <span>{t('donations_browse_btn')}</span>
            </button>
          </div>
        ) : (
          /* RESPONSIVE DONATION CARDS GRID (1, 2, or 3 Columns) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <div
                key={act._id}
                className="card-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between"
                style={{ border: '1px solid var(--card-border)' }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {act.bloodGroup} • {act.bloodComponent}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        act.status === 'committed'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : act.status === 'donated' || act.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {act.statusLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                      Patient: {act.patientName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{act.hospitalName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(act.requiredDate).toLocaleDateString()}</span>
                  </div>
                  {act.requesterPhone && (
                    <a
                      href={`tel:${act.requesterPhone}`}
                      className="flex items-center gap-1 text-red-600 font-bold hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Contact Family</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDonations;
