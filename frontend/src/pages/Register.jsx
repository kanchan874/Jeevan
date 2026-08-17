import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Droplet, UserPlus, Mail, Lock, Phone, MapPin, ShieldAlert, Heart, X,
  Activity, Calendar, Scale, Stethoscope, AlertCircle, CheckCircle2, FileText,
  Building2, Database
} from 'lucide-react';

const Register = () => {
  const { register, error, setError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Role selection
  const [role, setRole] = useState('donor');

  // Basic Account Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [location, setLocation] = useState('');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [emergencyContactPerson, setEmergencyContactPerson] = useState('');
  const [department, setDepartment] = useState('');

  // Blood Bank fields
  const [bloodBankName, setBloodBankName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [operatingHours, setOperatingHours] = useState('24/7 Emergency');

  // Donor Eligibility Fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('65');
  const [hemoglobin, setHemoglobin] = useState('');
  const [currentHealthCondition, setCurrentHealthCondition] = useState('Healthy');
  const [selectedConditions, setSelectedConditions] = useState(['None']);
  const [currentMedications, setCurrentMedications] = useState('None');
  const [recentIllnessOrSurgery, setRecentIllnessOrSurgery] = useState(false);
  const [recentTattooOrPiercing, setRecentTattooOrPiercing] = useState(false);
  const [pregnancyStatus, setPregnancyStatus] = useState('Not Applicable');
  const [donationType, setDonationType] = useState('First-Time Donor');
  const [lastDonationDate, setLastDonationDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  // Mobile OTP States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    setOtpMessage(null);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid 10-digit Indian phone number first.' });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { mobile: phone });
      const data = response.data;
      if (data.success) {
        setOtpSent(true);
        setResendTimer(60);
        setOtpMessage({
          type: 'success',
          text: data.data?.isMock
            ? `Mock OTP generated! Use code: ${data.data.mockOtp}`
            : 'OTP sent to your mobile number via MSG91 SMS'
        });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Failed to send OTP' });
      }
    } catch (err) {
      console.error(err);
      setOtpMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error while sending OTP'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setOtpMessage({ type: 'error', text: 'Please enter the OTP sent to your mobile number.' });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { mobile: phone, otp });
      const data = response.data;
      if (data.verified) {
        setIsMobileVerified(true);
        setOtpMessage({ type: 'success', text: 'Mobile number verified successfully! ✓' });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Invalid OTP code' });
      }
    } catch (err) {
      console.error(err);
      setOtpMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error during OTP verification'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { return () => setError(null); }, [setError]);

  const handleConditionToggle = (cond) => {
    if (cond === 'None') { setSelectedConditions(['None']); return; }
    let updated = selectedConditions.filter((c) => c !== 'None');
    if (updated.includes(cond)) { updated = updated.filter((c) => c !== cond); if (updated.length === 0) updated = ['None']; }
    else { updated.push(cond); }
    setSelectedConditions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) { setError('Please enter a valid 10-digit Indian phone number'); return; }
    if (!isMobileVerified) { setError('Mobile number must be verified via MSG91 OTP before donor registration'); return; }

    if (role === 'donor' && !dob) { setError('Please enter your Date of Birth to verify donor eligibility'); return; }
    if (role === 'donor' && (Number(weight) < 30 || Number(weight) > 200)) { setError('Please enter a valid body weight (30-200 kg)'); return; }

    const data = {
      name: role === 'hospital' ? hospitalName : role === 'bloodbank' ? bloodBankName : name,
      email, password, phone, role, isMobileVerified: true,
      hospitalName, registrationNumber, emergencyContactPerson, department,
      bloodBankName, licenseNumber, operatingHours,
      bloodGroup, location, dob, gender,
      weight: Number(weight), hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      currentHealthCondition, majorMedicalConditions: selectedConditions,
      currentMedications, recentIllnessOrSurgery, recentTattooOrPiercing,
      pregnancyStatus, donationType, lastDonationDate: lastDonationDate || null
    };

    setPendingUserData(data);
    setShowGoogleModal(true);
  };

  const handleVerifyGoogle = async () => {
    setShowGoogleModal(false);
    if (!pendingUserData) return;
    setLoading(true);
    const simulatedGoogleId = `google_${pendingUserData.email.split('@')[0]}_id`;
    const res = await register({ ...pendingUserData, googleId: simulatedGoogleId, googleEmail: pendingUserData.email });
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const medicalConditionOptions = ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Hepatitis', 'Asthma', 'Thyroid Disorder', 'Other'];

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };
  const labelStyle = { color: 'var(--text-muted)' };

  const roles = [
    { id: 'donor', label: 'Individual / Donor', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'hospital', label: 'Hospital', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bloodbank', label: 'Blood Bank', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      <div className="card-panel p-6 md:p-8 space-y-6" style={{ border: '1px solid var(--card-border)' }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(220,38,38,0.08)' }}>
            <Droplet className="w-7 h-7 text-brand-600 fill-brand-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Join Jeevan</h2>
          <p className="text-xs font-semibold max-w-md" style={{ color: 'var(--text-muted)' }}>
            Register as a Donor, Hospital, or Blood Bank with verified eligibility
          </p>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div className="grid grid-cols-3 gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === r.id ? 'bg-brand-600 text-white shadow-md' : ''
              }`}
              style={role === r.id ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        {role === 'donor' && (
          <div className="p-3.5 rounded-xl flex items-start gap-3 text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#92400e' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <div className="space-y-1">
              <span className="font-bold block">Donor Screening Disclaimer</span>
              <p className="text-[11px] leading-relaxed">
                Health information generates a <strong>Preliminary Donor Status</strong>. Final screening by authorized blood banks.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-brand-700 text-xs font-semibold rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <ShieldAlert className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: CONTACT */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <UserPlus className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                {role === 'hospital' ? 'Hospital Details' : role === 'bloodbank' ? 'Blood Bank Details' : 'Account & Contact'}
              </h3>
            </div>

            {role === 'hospital' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Hospital Name</label>
                  <input type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="Apollo Emergency Center"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Registration Number</label>
                  <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="HOSP-TN-2024-XX"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Emergency Contact Person</label>
                  <input type="text" value={emergencyContactPerson} onChange={(e) => setEmergencyContactPerson(e.target.value)} placeholder="Dr. Arvind Swamy"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Trauma & Emergency Care"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
            )}

            {role === 'bloodbank' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Blood Bank Name</label>
                  <input type="text" required value={bloodBankName} onChange={(e) => setBloodBankName(e.target.value)} placeholder="Red Cross Central Blood Bank"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>License Number</label>
                  <input type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="BB-LIC-XXXX"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Operating Hours</label>
                  <input type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
            )}

            {role === 'donor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Full Name</label>
                  <input type="text" required placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((gp) => <option key={gp} value={gp}>{gp}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Common fields for all roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Email Address</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Password (min 6)</label>
                <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wide" style={labelStyle}>Phone (Indian +91)</label>
                <div className="flex gap-2">
                  <input type="tel" required placeholder="9876543210" value={phone} disabled={isMobileVerified || otpLoading}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setIsMobileVerified(false);
                      setOtpSent(false);
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-75" style={inputStyle} />
                  {!isMobileVerified && (
                    <button type="button" onClick={handleSendOTP}
                      disabled={otpLoading || resendTimer > 0 || !/^[6-9]\d{9}$/.test(phone)}
                      className="shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                      {otpLoading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div> : (
                        otpSent ? (resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP') : 'Send OTP'
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Location / Address</label>
                <input type="text" required placeholder="e.g. Adyar, Chennai" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
            </div>

            {/* OTP Entry Box */}
            {otpSent && !isMobileVerified && (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>Enter 6-Digit OTP</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Valid for 5 minutes</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" maxLength={6} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-extrabold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                  <button type="button" onClick={handleVerifyOTP} disabled={otpLoading || !otp}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    {otpLoading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div> : (
                      <><CheckCircle2 className="w-4 h-4" /><span>Verify OTP</span></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Verified Status Badge */}
            {isMobileVerified && (
              <div className="p-3 rounded-xl flex items-center justify-between text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mobile (+91 {phone}) Verified via MSG91 OTP ✓</span>
                </div>
                <button type="button" onClick={() => { setIsMobileVerified(false); setOtpSent(false); }} className="text-[10px] underline hover:text-emerald-700 cursor-pointer">
                  Change Number
                </button>
              </div>
            )}

            {/* OTP Status Feedback Message */}
            {otpMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                otpMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}>
                {otpMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{otpMessage.text}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: DONOR-ONLY - Physical Profile */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Activity className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Donor Physical Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Date of Birth</label>
                  <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Gender</label>
                  <select value={gender} onChange={(e) => { setGender(e.target.value); if (e.target.value === 'Male') setPregnancyStatus('Not Applicable'); }}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Weight (kg)</label>
                  <input type="number" required min="30" max="200" value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Hemoglobin (g/dL, Optional)</label>
                <input type="number" step="0.1" min="5" max="20" placeholder="e.g. 13.5" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
            </div>
          )}

          {/* SECTION 3: DONOR-ONLY - Medical Screening */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Stethoscope className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Medical & Health Screening</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Health Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Healthy & Well', value: 'Healthy', c: '#10b981' },
                    { label: 'Mild Unwellness', value: 'Mild Unwellness', c: '#f59e0b' },
                    { label: 'Unwell / Sick', value: 'Unwell', c: '#ef4444' }
                  ].map((item) => (
                    <button key={item.value} type="button" onClick={() => setCurrentHealthCondition(item.value)}
                      className="p-2.5 rounded-xl text-xs font-bold text-center cursor-pointer transition-all"
                      style={currentHealthCondition === item.value
                        ? { background: `${item.c}15`, border: `2px solid ${item.c}`, color: item.c }
                        : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }
                      }
                    >{item.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Major Medical Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {medicalConditionOptions.map((cond) => (
                    <button key={cond} type="button" onClick={() => handleConditionToggle(cond)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        selectedConditions.includes(cond) ? 'bg-brand-600 text-white font-bold' : ''
                      }`}
                      style={selectedConditions.includes(cond) ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
                    >{cond}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Medications</label>
                  <input type="text" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                {gender !== 'Male' && (
                  <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Pregnancy Status</label>
                    <select value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                      <option value="No">No</option><option value="Currently Pregnant / Breastfeeding">Currently Pregnant / Breastfeeding</option><option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input type="checkbox" checked={recentIllnessOrSurgery} onChange={(e) => setRecentIllnessOrSurgery(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>Major illness/surgery in last 6 months</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input type="checkbox" checked={recentTattooOrPiercing} onChange={(e) => setRecentTattooOrPiercing(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>Tattoo/piercing in last 6 months</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 4: DONOR-ONLY - Donation History */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <FileText className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Donation History</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Donation Type</label>
                  <select value={donationType} onChange={(e) => setDonationType(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    <option value="First-Time Donor">First-Time Donor</option><option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets (SDP)</option><option value="Plasma">Plasma</option>
                  </select>
                </div>
                {donationType !== 'First-Time Donor' && (
                  <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Last Donation Date</label>
                    <input type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 space-y-2">
            {!isMobileVerified && (
              <p className="text-[11px] font-semibold text-center text-amber-600 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Please verify mobile number via OTP to unlock registration.
              </p>
            )}
            <button type="submit" disabled={loading || !isMobileVerified}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/20 cursor-pointer">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : (
                <><Heart className="w-4 h-4 fill-current" /><span>Register & Verify Identity</span></>
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs pt-2" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
          Already registered?{' '}<Link to="/login" className="text-brand-600 hover:underline font-bold">Log In here</Link>
        </div>
      </div>

      {/* GOOGLE VERIFICATION MODAL */}
      {showGoogleModal && pendingUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="rounded-2xl w-full max-w-sm shadow-2xl p-6 relative" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <button onClick={() => setShowGoogleModal(false)} className="absolute right-4 top-4 p-1 rounded-full cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>Verify your Identity</h3>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Confirm credentials with Google to complete registration.</p>
            </div>
            <button onClick={handleVerifyGoogle}
              className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left cursor-pointer group"
              style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                  {pendingUserData.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{pendingUserData.name}</h4>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pendingUserData.email}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">Verify &rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
