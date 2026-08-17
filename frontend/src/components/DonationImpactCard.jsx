import React, { useState, useEffect, useContext } from 'react';
import { Flame, Heart, Calendar, Award, Lock, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const DonationImpactCard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState(null);

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/impact-stats');
      if (res.data && res.data.success) {
        setImpactData(res.data.impact);
      }
    } catch (err) {
      console.warn('[Impact Card Warning] Using fallback client calculations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute fallback data if API is pending or failed
  const fallbackDonations = user?.healthCheckupHistory?.length || (user?.lastDonationDate ? 1 : 0);
  const data = impactData || {
    totalDonations: fallbackDonations,
    livesSaved: fallbackDonations * 3,
    streak: fallbackDonations,
    nextEligibleDate: user?.lastDonationDate || null,
    daysRemaining: 0,
    isEligibleNow: true,
    badges: [
      {
        id: 'first_donation',
        title: 'First Lifesaver',
        description: 'Completed 1st lifetime blood donation',
        icon: '🩸',
        unlocked: fallbackDonations >= 1 || Boolean(user?.lastDonationDate),
        progress: 1
      },
      {
        id: 'champion_donor',
        title: 'Blood Champion',
        description: 'Achieved 3+ lifetime blood donations',
        icon: '🎖️',
        unlocked: fallbackDonations >= 3,
        progress: Math.min(3, fallbackDonations) / 3
      },
      {
        id: 'master_lifesaver',
        title: 'Master Lifesaver',
        description: 'Achieved 5+ lifetime blood donations',
        icon: '🏆',
        unlocked: fallbackDonations >= 5,
        progress: Math.min(5, fallbackDonations) / 5
      },
      {
        id: 'universal_hero',
        title: 'Universal Hero',
        description: 'O- or O+ High-Compatibility Donor',
        icon: '🦸',
        unlocked: ['O-', 'O+'].includes(user?.bloodGroup),
        progress: 1
      },
      {
        id: 'verified_lifeline',
        title: 'Verified Lifeline',
        description: 'Mobile Verified & Preliminary Health Cleared',
        icon: '🛡️',
        unlocked: Boolean(user?.isMobileVerified && user?.preliminaryStatus === 'Eligible'),
        progress: 1
      }
    ]
  };

  const {
    totalDonations,
    livesSaved,
    streak,
    nextEligibleDate,
    daysRemaining,
    isEligibleNow,
    badges
  } = data;

  return (
    <div className="card-panel p-6 md:p-8 rounded-3xl space-y-6 shadow-xl" style={{ border: '1px solid var(--card-border)' }}>
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Donor Gamification & Impact</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            {t('impact_title')}
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('impact_subtitle')}
          </p>
        </div>

        {/* ELIGIBILITY STATUS PILL */}
        <div className="shrink-0">
          {isEligibleNow ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-500 text-xs font-black border border-emerald-500/30 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('impact_ready_today')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/15 text-amber-500 text-xs font-black border border-amber-500/30 shadow-sm">
              <Clock className="w-4 h-4" />
              <span>{t('impact_eligible_in', { days: daysRemaining })}</span>
            </span>
          )}
        </div>
      </div>

      {/* STATS TILES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TILE 1: DONATION STREAK */}
        <div className="p-5 rounded-2xl space-y-2 flex flex-col justify-between" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {t('impact_streak_label')}
            </span>
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500 flex items-baseline gap-1">
              <span>{streak}</span>
              <span className="text-xs font-bold text-slate-400">{t('impact_donations_suffix')}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {t('impact_streak_sub')}
            </p>
          </div>
        </div>

        {/* TILE 2: LIVES SAVED ESTIMATE */}
        <div className="p-5 rounded-2xl space-y-2 flex flex-col justify-between" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {t('impact_lives_label')}
            </span>
            <div className="p-2 rounded-xl bg-red-500/15 text-red-500">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-red-500 flex items-baseline gap-1">
              <span>~{livesSaved}</span>
              <span className="text-xs font-bold text-slate-400">{t('impact_lives_suffix')}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {t('impact_lives_sub')}
            </p>
          </div>
        </div>

        {/* TILE 3: NEXT ELIGIBLE COUNTDOWN */}
        <div className="p-5 rounded-2xl space-y-2 flex flex-col justify-between" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {t('impact_next_date_label')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-base font-black truncate" style={{ color: 'var(--text-heading)' }}>
              {nextEligibleDate ? new Date(nextEligibleDate).toLocaleDateString() : t('impact_eligible_now')}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {isEligibleNow ? t('impact_no_waiting') : t('impact_days_rem', { days: daysRemaining })}
            </p>
          </div>
        </div>
      </div>

      {/* BADGES GRID */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-brand-500" />
          <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {t('impact_badges_title')}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-2 relative transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-red-500/10 to-red-600/5 border-red-500/30 shadow-md scale-100'
                  : 'opacity-50 grayscale border-slate-700 bg-slate-900/40'
              }`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div>
                <span className="text-xs font-black block leading-tight" style={{ color: 'var(--text-heading)' }}>
                  {badge.title}
                </span>
                <span className="text-[10px] font-semibold block text-slate-400 mt-0.5 leading-tight">
                  {badge.description}
                </span>
              </div>

              {!badge.unlocked && (
                <div className="absolute top-2 right-2 text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonationImpactCard;
