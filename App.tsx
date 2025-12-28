
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Institution, Student, Package } from './types';
import { NAV_ITEMS } from './constants';
import Layout from './components/Layout';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceModule from './components/AttendanceModule';
import OnboardingWizard from './views/OnboardingWizard';
import { Lock, ShieldCheck, Loader2, School, Info, Mail, CheckCircle, RefreshCw, LogOut, Database, Settings, X, Plus } from 'lucide-react';
import { auth, getInstitutionProfile, saveInstitutionProfile } from './lib/firebase';
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
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email?.toLowerCase();
        const isOwner = userEmail === 'owner2011@smartclass.lk' || userEmail === 'owner@2011@smartclass.lk';
        const role = isOwner ? UserRole.SUPER_ADMIN : UserRole.INSTITUTION_ADMIN;
        
        let agreementAccepted = true;
        if (!isOwner) {
          const profile = await getInstitutionProfile(user.uid);
          agreementAccepted = profile?.agreementAccepted === true;
        }

        setState(prev => ({
          ...prev,
          user: { 
            uid: user.uid,
            role, 
            name: isOwner ? 'System Owner' : (user.displayName || user.email?.split('@')[0] || 'Institution Admin'),
            email: user.email || undefined,
            emailVerified: user.emailVerified,
            agreementAccepted: agreementAccepted,
            institutionId: role === UserRole.INSTITUTION_ADMIN ? 'school-1' : undefined
          }
        }));
      } else {
        setState(prev => ({ ...prev, user: null }));
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    const id = loginId.trim();
    const pass = loginPass.trim();

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
      if (!finalEmail.includes('@')) {
        finalEmail = `${finalEmail.toLowerCase()}@smartclass.lk`;
      }
      await signInWithEmailAndPassword(auth, finalEmail, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setShowSetupGuide(true);
      } else {
        setAuthError("Invalid credentials. Please check your login details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    setState(prev => ({ ...prev, user: null }));
    setActiveTab('dashboard');
  };

  const reloadUserStatus = async () => {
    setIsLoading(true);
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const profile = await getInstitutionProfile(auth.currentUser.uid);
      setState(prev => prev.user ? ({
        ...prev,
        user: {
          ...prev.user!,
          emailVerified: auth.currentUser?.emailVerified,
          agreementAccepted: profile?.agreementAccepted === true
        }
      }) : prev);
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = async (data: any) => {
    if (state.user?.uid) {
      await saveInstitutionProfile(state.user.uid, {
        ...data,
        status: 'active',
        agreementAccepted: true,
        agreementAcceptedAt: new Date().toISOString()
      });
      
      const newSchool: Institution = {
        id: `school-${Date.now()}`,
        name: data.name,
        country: data.country,
        address: data.address,
        nic: data.nic,
        contact: data.contact,
        email: data.email,
        status: 'active',
        agreementAcceptedAt: new Date().toISOString(),
        institutionCode: `SCH-${Math.floor(Math.random() * 900) + 100}`,
        verified: true
      };

      setState(prev => ({
        ...prev,
        institutions: [...prev.institutions, newSchool],
        user: prev.user ? { ...prev.user, agreementAccepted: true } : null
      }));
    }
    setIsRegistering(false);
  };

  const renderContent = () => {
    const { user } = state;
    if (!user) return null;

    // Security Gate 1: Email Verification
    if (!user.emailVerified && user.role !== UserRole.SUPER_ADMIN) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
           <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-500/20 mb-10 shadow-2xl">
              <Mail className="text-blue-500" size={40} />
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Verify Your Email</h2>
           <p className="max-w-md text-slate-500 text-[11px] font-black uppercase tracking-widest leading-relaxed mb-10">
              We've sent a verification link to <span className="text-blue-400">{user.email}</span>. 
              Please verify your account to access the school panel.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button 
                onClick={reloadUserStatus}
                className="flex-1 bg-white text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl"
              >
                <RefreshCw size={16} /> I've Verified My Email
              </button>
              <button 
                onClick={() => auth.currentUser && sendEmailVerification(auth.currentUser)}
                className="flex-1 bg-slate-900 text-slate-400 border border-slate-800 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px]"
              >
                Resend Link
              </button>
           </div>
        </div>
      );
    }

    // Security Gate 2: Agreement Acceptance
    if (!user.agreementAccepted && user.role !== UserRole.SUPER_ADMIN) {
      return (
        <div className="max-w-4xl mx-auto">
          <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={handleLogout} />
        </div>
      );
    }

    // Dashboard Access
    if (user.role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <SuperAdminDashboard institutions={state.institutions} onAddInstitution={() => setIsRegistering(true)} packages={state.packages} />;
        case 'institutions': return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">School Registry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.institutions.map(inst => (
                <div key={inst.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-slate-700">
                        <School size={24} />
                      </div>
                      <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">active</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2 truncate">{inst.name}</h3>
                   <p className="text-slate-500 text-xs mb-6 font-mono">{inst.email}</p>
                   <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                     <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{inst.institutionCode}</span>
                     <button className="text-blue-500 text-xs font-black uppercase tracking-widest group-hover:underline">Manage</button>
                   </div>
                </div>
              ))}
              {state.institutions.length === 0 && (
                <button onClick={() => setIsRegistering(true)} className="aspect-square border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all group">
                  <Plus className="mb-4 group-hover:scale-110 transition-transform" size={40} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Register First School</span>
                </button>
              )}
            </div>
          </div>
        );
        default: return <div className="text-center py-40 text-slate-600 font-black uppercase tracking-widest">Awaiting Data...</div>;
      }
    }

    if (user.role === UserRole.INSTITUTION_ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">School Panel</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Students', val: state.students.length, color: 'bg-blue-600' },
                  { label: 'Status', val: 'Active', color: 'bg-slate-900 border border-slate-800' },
                  { label: 'System', val: 'Cloud Sync', color: 'bg-slate-900 border border-slate-800' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} p-10 rounded-[3rem] shadow-2xl transition-transform hover:scale-[1.01]`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">{stat.label}</p>
                    <p className="text-4xl font-black tracking-tighter uppercase italic">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'students': return <StudentManagement students={state.students} onAddStudent={() => {}} />;
        case 'attendance': return <AttendanceModule />;
        default: return <div className="text-center py-40 text-slate-600 font-bold uppercase tracking-widest italic">Feature coming soon</div>;
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
              <Lock className="text-blue-500" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">Smart Class Hub</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest italic">Global Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="USER NAME"
                required
                className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="PASSWORD"
                required
                className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                {authError}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <ShieldCheck size={20} /> Login to System
            </button>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
              <Database size={20} className="text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-white font-black uppercase tracking-widest mb-1">Owner Access Enabled</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Login with <span className="text-blue-400">Owner@2011</span> to bypass setup.
                </p>
              </div>
            </div>

            <div className="pt-8 text-center space-y-4 border-t border-white/5">
              <button type="button" onClick={() => setIsRegistering(true)} className="w-full py-4 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all shadow-lg">
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
      {renderContent()}
    </Layout>
  );
};

export default App;
