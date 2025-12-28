
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Institution, Student, Package } from './types';
import { NAV_ITEMS } from './constants';
import Layout from './components/Layout';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceModule from './components/AttendanceModule';
import OnboardingWizard from './views/OnboardingWizard';
import { Lock, LogIn, Globe, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const PACKAGE_CONFIG: Package[] = [
  { id: 'pkg-1', name: 'Lite Node', price: 49, studentLimit: 200, features: ['Attendance', 'QR ID'] },
  { id: 'pkg-2', name: 'Core Node', price: 149, studentLimit: 1000, features: ['Attendance', 'QR ID', 'Ledger'] },
  { id: 'pkg-3', name: 'Elite Node', price: 499, studentLimit: 5000, features: ['Full Suite', 'AI Insights'] },
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // In production, we'd fetch user roles from Firestore/RTDB
        // For now, we'll map the hardcoded owner or default to institution admin
        const role = user.email === 'Owner@2011' ? UserRole.SUPER_ADMIN : UserRole.INSTITUTION_ADMIN;
        setState(prev => ({
          ...prev,
          user: { 
            role, 
            name: user.displayName || user.email?.split('@')[0] || 'Authorized User',
            email: user.email || undefined,
            institutionId: role === UserRole.INSTITUTION_ADMIN ? 'inst-default' : undefined
          }
        }));
      } else {
        setState(prev => ({ ...prev, user: null }));
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      // Production Login Flow
      await signInWithEmailAndPassword(auth, loginId.trim(), loginPass.trim());
      setLoginId('');
      setLoginPass('');
    } catch (err: any) {
      console.error("Auth Failure:", err);
      setAuthError("CRITICAL: UNAUTHORIZED CREDENTIALS OR SYSTEM FAULT.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setState(prev => ({ ...prev, user: null }));
  };

  const handleOnboardingComplete = (data: any) => {
    const newInst: Institution = {
      id: `inst-${Date.now()}`,
      name: data.name,
      country: data.country,
      address: data.address,
      nic: data.nic,
      contact: data.contact,
      email: data.email,
      status: 'pending',
      agreementAcceptedAt: new Date().toISOString(),
      institutionCode: `NODE-${Math.floor(Math.random() * 900) + 100}`,
      verified: false
    };

    setState(prev => ({
      ...prev,
      institutions: [...prev.institutions, newInst]
    }));
    setIsRegistering(false);
  };

  const renderContent = () => {
    if (!state.user) return null;

    if (state.user.role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <SuperAdminDashboard institutions={state.institutions} onAddInstitution={() => setIsRegistering(true)} packages={state.packages} />;
        case 'institutions': return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Infrastructure Node Registry</h2>
            {state.institutions.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-600 font-black uppercase tracking-[0.2em]">No Operational Nodes Detected</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.institutions.map(inst => (
                  <div key={inst.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-slate-700">
                          {inst.country.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${inst.verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {inst.verified ? 'verified' : 'pending'}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 truncate">{inst.name}</h3>
                     <p className="text-slate-500 text-xs mb-6 font-mono">{inst.email}</p>
                     <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                       <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{inst.institutionCode}</span>
                       <button className="text-blue-500 text-xs font-black uppercase tracking-widest group-hover:underline">Manage Node</button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        default: return <div className="text-center py-40 text-slate-600 font-black uppercase italic tracking-[0.2em]">Terminal Interface Standby</div>;
      }
    }

    if (state.user.role === UserRole.INSTITUTION_ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Institutional Console</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Personnel Registry', val: state.students.length, color: 'bg-blue-600' },
                  { label: 'Network Uptime', val: '100%', color: 'bg-slate-900 border border-slate-800' },
                  { label: 'Active Ledger', val: state.payments.length, color: 'bg-slate-900 border border-slate-800' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} p-10 rounded-[3rem] shadow-2xl transition-transform hover:scale-[1.01]`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">{stat.label}</p>
                    <p className="text-4xl font-black tracking-tighter">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'students':
          return <StudentManagement students={state.students} onAddStudent={() => {}} />;
        case 'attendance':
          return <AttendanceModule />;
        default:
          return <div className="text-center py-40 text-slate-600 font-bold uppercase tracking-widest">Awaiting Command...</div>;
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>

        <div className="max-w-[480px] w-full bg-[#0a101f]/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-8">
              <Lock className="text-blue-500" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">Authority Terminal</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Credentials Validation Required</p>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-6">
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="AUTHORITY EMAIL"
                required
                className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold tracking-wide text-white focus:border-blue-500/50 outline-none transition-all"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="SECURITY KEY"
                required
                className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold tracking-wide text-white focus:border-blue-500/50 outline-none transition-all"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              Authorize Session
            </button>

            <div className="pt-8 text-center space-y-4 border-t border-white/5">
              <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">New Institution Deployment?</p>
              <button 
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
              >
                Request System Node
              </button>
            </div>
          </form>
        </div>

        {isRegistering && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] overflow-y-auto animate-in fade-in duration-300">
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
      {renderContent()}
      {isRegistering && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={() => setIsRegistering(false)} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
