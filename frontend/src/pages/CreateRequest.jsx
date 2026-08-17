import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, HelpCircle, Navigation, Calendar as CalendarIcon, Clock, User, FileText,
  Droplet, PlusCircle, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Heart
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import EligibilityModal from '../components/EligibilityModal';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Component Selection
  const [bloodComponent, setBloodComponent] = useState('Red Blood Cells');

  // Requester Information
  const [requesterPhone, setRequesterPhone] = useState(user?.phone || '8788277975');
  const [requesterEmail, setRequesterEmail] = useState(user?.email || 'kanchangaikwad2006@gmail.com');

  // Location Details
  const [hospitalName, setHospitalName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [locating, setLocating] = useState(false);

  // Blood Information
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState('Medium');

  // Timing Information
  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [requiredTime, setRequiredTime] = useState('');

  // Patient Details (Optional)
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [diseaseReason, setDiseaseReason] = useState('');

  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            setFullAddress(data.display_name || '');
            setCity(data.address.city || data.address.town || data.address.suburb || 'Local Area');
            setDistrict(data.address.state_district || data.address.state || '');
            if (!hospitalName) {
              setHospitalName(data.address.hospital || data.address.amenity || 'Current Location Facility');
            }
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setFullAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to fetch location. Please enter details manually.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!hospitalName && !fullAddress) {
      setError('Please provide Hospital Name or Full Address.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requesterPhone,
        requesterEmail,
        bloodComponent,
        hospitalName,
        fullAddress,
        city,
        district,
        hospitalAddress: `${hospitalName} ${fullAddress} ${city}`.trim(),
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        urgency,
        requiredDate,
        requiredTime: requiredTime || 'Anytime',
        patientName: patientName || 'Anonymous Patient',
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        diseaseReason,
        additionalNotes
      };

      const res = await api.post('/requests/create', payload);

      if (res.data && res.data.success) {
        navigate('/donors', {
          state: {
            matchedDonors: res.data.matchedDonors,
            bloodGroup,
            hospitalAddress: payload.hospitalAddress,
            patientName: payload.patientName,
            unitsRequired,
            urgency,
            requestCreated: true
          }
        });
      }
    } catch (err) {
      console.error('Request creation error:', err);
      setError(err.response?.data?.message || 'Failed to submit blood request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };

  return (
    <div className="min-h-screen pb-16">
      {/* RESPONSIVE WEBSITE HERO BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-brand-600 to-red-700 text-white py-8 px-6 shadow-lg border-b border-red-700/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('create_req_title')}</h1>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Live Emergency Feed
                </span>
              </div>
              <p className="text-xs md:text-sm text-red-100 font-medium mt-1">
                {t('create_req_sub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEligibilityModal(true)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-white" />
              <span>Eligibility & Safety Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL RESPONSIVE CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        
        {/* INFO NOTICE BANNER */}
        <div className="mb-6 p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 shadow-sm" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
          <Sparkles className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm">Where will your request be seen?</span>
            <p className="text-xs leading-relaxed opacity-90" style={{ color: 'var(--text-muted)' }}>
              Upon submission, your request is published to the <strong>Live Requests Feed</strong>, sent directly to <strong>Nearby Compatible Donors via SMS/WhatsApp alerts</strong>, and visible on your <strong>Dashboard & My Donations</strong> activity tab.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* RESPONSIVE 2-COLUMN GRID FOR DESKTOP / LAPTOP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: REQUESTER, LOCATION, TIMING & NOTES */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CARD 1: REQUESTER INFORMATION */}
              <div className="card-panel p-6 rounded-3xl space-y-4" style={{ border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <User className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                    Requester Contact Info
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Mobile Number (+91)
                    </label>
                    <input
                      type="text"
                      required
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: LOCATION DETAILS */}
              <div className="card-panel p-6 rounded-3xl space-y-4" style={{ border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                      Hospital & Location Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{locating ? 'Locating...' : '📍 Use Current Location'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Emergency Hospital"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Full Address / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="e.g. No. 21, Greams Lane, Thousand Lights"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        District / State
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: TIMING & ADDITIONAL NOTES */}
              <div className="card-panel p-6 rounded-3xl space-y-4" style={{ border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <CalendarIcon className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                    Timing & Notes
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Required Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Required Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={requiredTime}
                      onChange={(e) => setRequiredTime(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Additional Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Enter any additional requirements, contact instructions, or hospital floor details..."
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    style={inputStyle}
                  />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: BLOOD TYPE, COMPONENT, PATIENT DETAILS & SUBMIT */}
            <div className="lg:col-span-5 space-y-6">

              {/* CARD 4: BLOOD COMPONENT & BLOOD GROUP */}
              <div className="card-panel p-6 rounded-3xl space-y-5" style={{ border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <Droplet className="w-4 h-4 text-brand-600 fill-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                    Blood Requirement Details
                  </h3>
                </div>

                {/* BLOOD COMPONENT SELECTOR */}
                <div>
                  <label className="block text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Component Required
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Red Blood Cells', 'Whole Blood', 'Platelets', 'Plasma'].map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setBloodComponent(comp)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                          bloodComponent === comp
                            ? 'bg-brand-600 text-white shadow-md'
                            : ''
                        }`}
                        style={bloodComponent === comp ? {} : { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BLOOD TYPE SELECTION GRID */}
                <div>
                  <label className="block text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Blood Group Required *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setBloodGroup(group)}
                        className={`py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${
                          bloodGroup === group
                            ? 'bg-brand-600 text-white shadow-lg scale-105'
                            : ''
                        }`}
                        style={bloodGroup === group ? {} : { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Units Required *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={unitsRequired}
                      onChange={(e) => setUnitsRequired(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Urgency Level *
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    >
                      <option value="High">Emergency / High</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low / Standard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 5: PATIENT DETAILS (OPTIONAL) */}
              <div className="card-panel p-6 rounded-3xl space-y-4" style={{ border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <User className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                    Patient Details (Optional)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Patient Age
                      </label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Age"
                        className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Gender
                      </label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        style={inputStyle}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Disease / Medical Reason
                    </label>
                    <input
                      type="text"
                      value={diseaseReason}
                      onChange={(e) => setDiseaseReason(e.target.value)}
                      placeholder="e.g. Dengue Platelet Drop / Surgery"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/30 transition-all cursor-pointer text-sm tracking-wide"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Submit Request & Match Donors</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </form>

      </div>

      {/* ELIGIBILITY MODAL */}
      <EligibilityModal
        isOpen={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        onContinue={() => setShowEligibilityModal(false)}
      />
    </div>
  );
};

export default CreateRequest;
