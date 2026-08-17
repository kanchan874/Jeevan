import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, LogIn, Mail, Lock, ShieldAlert, Chrome, X, Building2, Database } from 'lucide-react';

const Login = () => {
  const { login, googleLoginMock, error, setError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { return () => setError(null); }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setLoading(true);
    const res = await login(demoEmail, 'password123');
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const handleSelectGoogleAccount = async (selectedEmail, selectedName, selectedId) => {
    setShowGoogleModal(false);
    setLoading(true);
    const res = await googleLoginMock({ googleId: selectedId, name: selectedName, email: selectedEmail });
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="max-w-md mx-auto px-6 py-16 relative">
      <div className="card-panel p-8 space-y-6" style={{ border: '1px solid var(--card-border)' }}>
        {/* LOGO */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(220,38,38,0.08)' }}>
            <Droplet className="w-7 h-7 text-brand-600 fill-brand-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Welcome Back</h2>
          <p className="text-xs font-semibold" style={labelStyle}>Log in to update status or request blood</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-brand-700 text-xs font-semibold rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <ShieldAlert className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Email Address</label>
            <div className="relative">
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" style={inputStyle} />
              <Mail className="absolute left-3.5 top-3 w-4 h-4" style={labelStyle} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Password</label>
            <div className="relative">
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" style={inputStyle} />
              <Lock className="absolute left-3.5 top-3 w-4 h-4" style={labelStyle} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-600/20 cursor-pointer">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : <><LogIn className="w-4 h-4" /><span>Log In</span></>}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow" style={{ borderTop: '1px solid var(--card-border)' }}></div>
          <span className="flex-shrink mx-3 text-[9px] uppercase tracking-widest font-bold" style={labelStyle}>Or Connect With</span>
          <div className="flex-grow" style={{ borderTop: '1px solid var(--card-border)' }}></div>
        </div>

        {/* GOOGLE SIGN IN */}
        <button onClick={() => setShowGoogleModal(true)} disabled={loading}
          className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
          style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* DEMO ACCOUNTS */}
        <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <h4 className="text-[9px] font-bold uppercase tracking-widest" style={labelStyle}>Sandbox Accounts</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleQuickDemoLogin('rajesh.kumar@example.com')}
              className="text-[10px] font-bold py-2 px-2.5 rounded-lg text-center transition-all truncate cursor-pointer"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }} title="Rajesh O-">
              Rajesh (O-)
            </button>
            <button onClick={() => handleQuickDemoLogin('priya.sundaram@example.com')}
              className="text-[10px] font-bold py-2 px-2.5 rounded-lg text-center transition-all truncate cursor-pointer"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }} title="Priya A+">
              Priya (A+)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleQuickDemoLogin('apollo.hospital@example.com')}
              className="text-[10px] font-bold py-2 px-2.5 rounded-lg text-center transition-all truncate cursor-pointer flex items-center justify-center gap-1"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }} title="Hospital Demo">
              <Building2 className="w-3 h-3" /> Hospital
            </button>
            <button onClick={() => handleQuickDemoLogin('redcross.bb@example.com')}
              className="text-[10px] font-bold py-2 px-2.5 rounded-lg text-center transition-all truncate cursor-pointer flex items-center justify-center gap-1"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }} title="Blood Bank Demo">
              <Database className="w-3 h-3" /> Blood Bank
            </button>
          </div>
        </div>

        {/* REGISTER LINK */}
        <div className="text-center text-xs" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px', color: 'var(--text-muted)' }}>
          New to Jeevan?{' '}<Link to="/register" className="text-brand-600 hover:underline font-bold">Create Account</Link>
        </div>
      </div>

      {/* GOOGLE MODAL */}
      {showGoogleModal && (
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
              <h3 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>Sign in with Google</h3>
              <p className="text-xs font-semibold" style={labelStyle}>to continue to <span className="text-brand-600 font-bold">Jeevan</span></p>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Vikram Gowda', email: 'vikram.gowda@gmail.com', id: 'google_v_gowda_1020' },
                { name: 'Kanchan Dev', email: 'kanchan.dev@gmail.com', id: 'google_kanchan_dev_2030' }
              ].map((acc) => (
                <button key={acc.id} onClick={() => handleSelectGoogleAccount(acc.email, acc.name + ' (Google)', acc.id)}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <div className="w-8 h-8 rounded-full bg-brand-600/10 flex items-center justify-center font-bold text-xs text-brand-600 uppercase">{acc.name.charAt(0)}</div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{acc.name}</div>
                    <div className="text-[10px] font-medium" style={labelStyle}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center text-[10px] mt-6 font-semibold" style={labelStyle}>
              Mock Google account chooser for prototyping sandbox.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
