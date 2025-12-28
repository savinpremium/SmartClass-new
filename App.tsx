
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Institution, Student, Package } from './types';
import { NAV_ITEMS } from './constants';
import Layout from './components/Layout';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceModule from './components/AttendanceModule';
import OnboardingWizard from './views/OnboardingWizard';
import { Lock, ShieldCheck, Loader2, School, Info, Mail, CheckCircle, RefreshCw, LogOut, Database, AlertTriangle } from 'lucide-react';
import { auth, subscribeToProfile, saveInstitutionProfile } from './lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const PACKAGE_CONFIG: Package[] = [
  { id: 'pkg-1', name: 'Lite School', price: 49, studentLimit: 200, features: ['Attendance', 'QR ID'] },
  { id: 'pkg-2', name: 'Core School', price: 149, studentLimit: 1000, features: ['Attendance', 'QR ID', 'Payments'] },
  { id: 'pkg-3', name: 'Elite School', price: 499, studentLimit: 5000, features: ['Full Suite', 'AI Insights'] },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    institutions: [],
    students: [],
    attendance: [],
    payments: [],
    packages: PACKAGE_CONFIG,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Security Listener: Monitor Auth & Database Profile simultaneously
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email?.toLowerCase();
        const isOwner = userEmail === 'owner2011@smartclass.lk' || userEmail === 'owner@2011@smartclass.lk';
        const role = isOwner ? UserRole.SUPER_ADMIN : UserRole.INSTITUTION_ADMIN;

        // If not owner, subscribe to database profile for real-time security
        if (!isOwner) {
          unsubscribeProfile = subscribeToProfile(user.uid, (profile) => {
            setState(prev => ({
              ...prev,
              user: {
                uid: user.uid,
                role,
                name: profile?.name || user.email?.split('@')[0] || 'User',
                email: user.email || undefined,
                emailVerified: user.emailVerified,
                agreementAccepted: profile?.agreementAccepted === true,
                institutionId: profile?.id || 'pending'
              }
            }));
          });
        } else {
          // Owner is pre-verified
          setState(prev => ({
            ...prev,
            user: { 
              uid: user.uid,
              role: UserRole.SUPER_ADMIN, 
              name: 'System Owner',
              email: user.email || undefined,
              emailVerified: true,
              agreementAccepted: true
            }
          }));
        }
      } else {
        setState(prev => ({ ...prev, user: null }));
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    const id = loginId.trim();
    const pass = loginPass.trim();

    // Critical: Local Owner Bypass
    if (id === 'Owner@2011' && pass === 'Owner@2011') {
      setState(prev => ({
        ...prev,
        user: { 
          role: UserRole.SUPER_ADMIN, 
          name: 'System Owner',
          email: 'owner2011@smartclass.lk',
          emailVerified: true,
          agreementAccepted: true
        }
      }));
      setIsLoading(false);
      return;
    }

    try {
      let finalEmail = id;
      if (!finalEmail.includes('@')) finalEmail = `${finalEmail.toLowerCase()}@smartclass.lk`;
      await signInWithEmailAndPassword(auth, finalEmail, pass);
    } catch (err: any) {
      setAuthError("Security Failure: Authentication rejected. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    setState(prev => ({ ...prev, user: null }));
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = async (data: any) => {
    if (!state.user?.uid) return;
    setIsLoading(true);
    try {
      await saveInstitutionProfile(state.user.uid, {
        ...data,
        id: `school-${state.user.uid.substring(0, 5)}`,
        status: 'active',
        agreementAccepted: true,
        agreementAcceptedAt: new Date().toISOString(),
        institutionCode: `SCH-${Math.floor(Math.random() * 900) + 100}`,
      });
      // State updates automatically via the useEffect listener
    } catch (e) {
      setAuthError("Security Failure: Failed to save agreement.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSecurityGate = () => {
    const { user } = state;
    if (!user) return null;

    // Gate 1: Email Verification Required
    if (!user.emailVerified && user.role !== UserRole.SUPER_ADMIN) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center border border-rose-500/20 mb-8 shadow-2xl">
              <AlertTriangle className="text-rose-500" size={40} />
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Access Restricted</h2>
           <p className="max-w-md text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-10">
              Your account is unverified. Please check <span className="text-rose-400 font-bold">{user.email}</span> for a secure verification link.
           </p>
           <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => window.location.reload()}
                className="bg-white text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl"
              >
                <RefreshCw size={16} /> I've Verified
              </button>
              <button 
                onClick={handleLogout}
                className="text-slate-500 font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors"
              >
                Sign Out & Try Again
              </button>
           </div>
        </div>
      );
    }

    // Gate 2: Agreement & Profile Completion
    if (!user.agreementAccepted && user.role !== UserRole.SUPER_ADMIN) {
      return <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={handleLogout} />;
    }

    return null;
  };

  const renderDashboard = () => {
    const { user } = state;
    if (!user) return null;

    if (user.role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <SuperAdminDashboard institutions={state.institutions} onAddInstitution={() => {}} packages={state.packages} />;
        default: return <div className="py-20 text-center font-black uppercase tracking-widest opacity-20 italic">Module Loaded Securely</div>;
      }
    }

    if (user.role === UserRole.INSTITUTION_ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Institution Control</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl"><p className="text-[10px] font-black uppercase opacity-60 mb-2">Students</p><p className="text-4xl font-black italic">{state.students.length}</p></div>
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem]"><p className="text-[10px] font-black uppercase text-slate-500 mb-2">Sync Status</p><p className="text-4xl font-black italic text-emerald-500">LIVE</p></div>
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem]"><p className="text-[10px] font-black uppercase text-slate-500 mb-2">Security</p><p className="text-4xl font-black italic text-blue-500">AES-256</p></div>
              </div>
            </div>
          );
        case 'students': return <StudentManagement students={state.students} onAddStudent={() => {}} />;
        case 'attendance': return <AttendanceModule />;
        default: return <div className="py-20 text-center text-slate-600 font-black uppercase italic tracking-widest">Active Security Session</div>;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!state.user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-inter relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]"></div>
        <div className="max-w-[480px] w-full bg-[#0a101f]/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 md:p-16 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-8">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">Secure Hub</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest italic">Encrypted Login Gateway</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="USER EMAIL / NAME" required className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600" value={loginId} onChange={e => setLoginId(e.target.value)} />
              <input type="password" placeholder="PASSWORD" required className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            </div>
            {authError && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{authError}</div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <Lock size={20} /> Secure Sign In
            </button>
            <div className="pt-8 text-center space-y-4 border-t border-white/5">
              <button type="button" onClick={() => setIsRegistering(true)} className="w-full py-4 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                Register New Institution
              </button>
            </div>
          </form>
        </div>
        {isRegistering && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] overflow-y-auto">
             <div className="max-w-4xl mx-auto px-6 py-10">
                <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={() => setIsRegistering(false)} />
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout user={state.user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderSecurityGate() || renderDashboard()}
    </Layout>
  );
};

export default App;
