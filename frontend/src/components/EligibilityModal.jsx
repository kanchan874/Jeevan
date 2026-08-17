import React, { useState } from 'react';
import { X, ShieldCheck, Heart, Info } from 'lucide-react';

const EligibilityModal = ({ isOpen, onClose, onContinue }) => {
  const [activeTab, setActiveTab] = useState('Blood');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        {/* Modal Header */}
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-600/10 text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Blood Donor Eligibility & Safety Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 cursor-pointer transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('Blood')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Blood' ? 'bg-brand-600 text-white shadow-md' : 'border'
            }`}
            style={activeTab === 'Blood' ? {} : { borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            Blood
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Platelets')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Platelets' ? 'bg-brand-600 text-white shadow-md' : 'border'
            }`}
            style={activeTab === 'Platelets' ? {} : { borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            Platelets
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed flex-grow" style={{ color: 'var(--text-heading)' }}>
          
          <div className="p-3.5 rounded-2xl bg-brand-600/10 border border-brand-600/20 text-brand-700 font-bold flex items-center gap-2">
            <Heart className="w-4 h-4 fill-brand-600 text-brand-600 shrink-0" />
            <span>Thanks for Volunteering to Give Blood!</span>
          </div>

          <p className="font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40">
            Only Indian residents are eligible to use TALBlood Aid app.
          </p>

          {/* Eligibility Rules */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-600">Core Eligibility Criteria</h4>
            <ul className="space-y-2 pl-2 list-disc list-inside font-medium" style={{ color: 'var(--text-muted)' }}>
              <li>You must be <strong>18 years & above</strong> and <strong>65 years & below</strong> to be a blood donor in India.</li>
              <li>Your hemoglobin level must not be less than <strong>12.5g/dl</strong>. Individuals with low hemoglobin levels or anemia will not be able to replenish blood easily.</li>
              <li>You must have a body weight of <strong>50 kgs & above</strong> to donate blood in India.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-600">Medical & Health Requirements</h4>
            <p className="font-semibold" style={{ color: 'var(--text-heading)' }}>You must be a healthy adult:</p>
            <ul className="space-y-2 pl-4 list-disc list-outside font-medium text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <li>You must not have any chronic disease/ infections such as cancer, heart disease, kidney disease, liver disease, HIV/AIDS, Hepatitis B or C, Tuberculosis, leprosy, etc.</li>
              <li>You must not have any STDs. You have not engaged in sexual activity with ‘at risk’/ high risk/ infected partners. You have not had sexual relations with multiple partners.</li>
              <li>You have not suffered from malaria, typhoid or other diseases that are transmissible in the recent past (atleast 3 months).</li>
              <li>You must not have any sort of drug addiction or have had drugs injected intravenously.</li>
              <li>You must not have any scars, cuts, punctures, etc. on the arm/ forearm from acupuncture, tattoos, previous blood donations, etc.</li>
              <li>You have not had any surgery in the past 12 months.</li>
              <li>You have your diabetes under control and not treated with insulin injections.</li>
              <li>You are not pregnant or lactating. You should not have stopped lactating atleast a year prior to donating. You have not had a miscarriage in the past 6 months.</li>
              <li>You have not had any immunization/vaccination for diphtheria, tetanus, cholera, typhoid, plague, or gamma globulin in 15 days prior to the donation. You have not had a rabies vaccination for atleast 1 year prior to the blood donation.</li>
              <li>You are not on steroids or other medications. It is important to consult a medical practitioner before donating blood if you are on any regular medication.</li>
              <li>Your blood pressure, pulse & body temperature is under control at the time of donation.</li>
              <li>Even though donated blood is tested & screened for diseases & infections, it is important to be honest about your medical condition & overall health. After all, it is a matter of someone else’s life, health & well-being.</li>
            </ul>
          </div>

          {/* Tips for Donor Safety */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Important Tips for Donor Safety</span>
            </h4>
            <ul className="space-y-2 pl-4 list-disc list-outside font-medium text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <li>Your last blood donation should be at least <strong>3 months prior for males</strong> and <strong>4 months for females</strong>.</li>
              <li>Do not ask for or accept any payment for blood donations. Professional/ paid blood donations are not permitted by law in India. Blood donation is a selfless, noble act of service that should be provided on a purely voluntary basis.</li>
              <li>Donate blood only at a clinic, hospital, blood banks, or blood donation drives by reputable/ trusted organizations/ nonprofits for your safety. Do NOT donate blood at unknown/ obscure/ random locations.</li>
              <li>Make sure a new injection is used to draw blood & is discarded after use.</li>
              <li>Make sure to drink plenty of water & fluids before donations and 24 hours after.</li>
              <li>Eat a nourishing, well-balanced diet before and after blood donation.</li>
              <li>Have a good night’s sleep the night before the blood donation.</li>
              <li>Do not engage in strenuous physical activity or workouts after the blood donation.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)', background: 'var(--subtle-bg)' }}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all hover:bg-black/5"
              style={{ borderColor: '#dc2626', color: '#dc2626' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="w-1/2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
            >
              Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EligibilityModal;
