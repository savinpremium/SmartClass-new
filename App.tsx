
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Institution, Student, Package } from './types';
import { NAV_ITEMS } from './constants';
import Layout from './components/Layout';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceModule from './components/AttendanceModule';
import OnboardingWizard from './views/OnboardingWizard';
// Added X to imports
import { Lock, ShieldCheck, Loader2, School, Info, AlertTriangle, ExternalLink, Settings, X } from 'lucide-react';
import { auth } from './lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email?.toLowerCase();
        const isOwner = userEmail === 'owner2011@smartclass.lk' || userEmail === 'owner@2011@smartclass.lk';
        const role = isOwner ? UserRole.SUPER_ADMIN : UserRole.INSTITUTION_ADMIN;
        
        setState(prev => ({
          ...prev,
          user: { 
            role, 
            name: isOwner ? 'System Owner' : (user.displayName || user.email?.split('@')[0] || 'User'),
            email: user.email || undefined,
            institutionId: role === UserRole.INSTITUTION_ADMIN ? 'school-1' : undefined
          }
        }));
      } else {
        // If not authenticated via Firebase, check if we are already in a "local owner" session
        // (This happens if we used the hardcoded bypass below)
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    const trimmedId = loginId.trim();
    const trimmedPass = loginPass.trim();

    // SYSTEM OWNER BYPASS: Allows login even if Firebase config is broken
    if (trimmedId === 'Owner@2011' && trimmedPass === 'Owner@2011') {
      setState(prev => ({
        ...prev,
        user: { 
          role: UserRole.SUPER_ADMIN, 
          name: 'System Owner',
          email: 'owner2011@smartclass.lk'
        }
      }));
      setIsLoading(false);
      return;
    }

    try {
      let finalEmail = trimmedId;
      if (!finalEmail.includes('@')) {
        finalEmail = `${finalEmail.toLowerCase()}@smartclass.lk`;
      }
      
      await signInWithEmailAndPassword(auth, finalEmail, trimmedPass);
      setLoginId('');
      setLoginPass('');
    } catch (err: any) {
      console.error("Login Error:", err.code);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Firebase Error: Email login is disabled in the console.");
        setShowSetupGuide(true);
      } else if (err.code === 'auth/invalid-email') {
        setAuthError("Please enter a valid user email.");
      } else {
        setAuthError("Wrong user or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setState(prev => ({ ...prev, user: null }));
  };

  const handleOnboardingComplete = (data: any) => {
    const newSchool: Institution = {
      id: `school-${Date.now()}`,
      name: data.name,
      country: data.country,
      address: data.address,
      nic: data.nic,
      contact: data.contact,
      email: data.email,
      status: 'pending',
      agreementAcceptedAt: new Date().toISOString(),
      institutionCode: `SCH-${Math.floor(Math.random() * 900) + 100}`,
      verified: false
    };

    setState(prev => ({
      ...prev,
      institutions: [...prev.institutions, newSchool]
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
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">School Registry</h2>
            {state.institutions.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-600 font-black uppercase tracking-widest">No schools registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.institutions.map(inst => (
                  <div key={inst.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-slate-700">
                          <School size={24} />
                        </div>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${inst.verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {inst.verified ? 'active' : 'pending'}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 truncate">{inst.name}</h3>
                     <p className="text-slate-500 text-xs mb-6 font-mono">{inst.email}</p>
                     <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                       <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{inst.institutionCode}</span>
                       <button className="text-blue-500 text-xs font-black uppercase tracking-widest group-hover:underline">Manage School</button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        default: return <div className="text-center py-40 text-slate-600 font-black uppercase italic tracking-widest">Awaiting Data...</div>;
      }
    }

    if (state.user.role === UserRole.INSTITUTION_ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">My Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Students', val: state.students.length, color: 'bg-blue-600' },
                  { label: 'Status', val: 'Online', color: 'bg-slate-900 border border-slate-800' },
                  { label: 'Payments', val: state.payments.length, color: 'bg-slate-900 border border-slate-800' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} p-10 rounded-[3rem] shadow-2xl transition-transform hover:scale-[1.01]`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">{stat.label}</p>
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
          return <div className="text-center py-40 text-slate-600 font-bold uppercase tracking-widest italic">Please select a tab</div>;
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
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">Smart Class Portal</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Enter login details</p>
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

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              Login to System
            </button>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <Info size={16} className="text-blue-400 flex-shrink-0" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                System Owner? Use <span className="text-white">Owner@2011</span> with pass <span className="text-white">Owner@2011</span>
              </p>
            </div>

            <div className="pt-8 text-center space-y-4 border-t border-white/5">
              <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">New school registration?</p>
              <button 
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
              >
                Register Now
              </button>
            </div>
          </form>
        </div>

        {/* Firebase Setup Instructions Modal */}
        {showSetupGuide && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-xl w-full bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowSetupGuide(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
              
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 mb-8">
                <Settings className="text-amber-500" size={32} />
              </div>

              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">Firebase Config Needed</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                The <span className="text-white font-bold italic">auth/operation-not-allowed</span> error means the Email sign-in method is disabled in your project.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  "Go to Firebase Console (lms-e-6f847)",
                  "Click 'Authentication' in the sidebar",
                  "Go to 'Sign-in method' tab",
                  "Find 'Email/Password' and set it to Enabled",
                  "Save and Refresh this app"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">{i + 1}</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{step}</span>
                  </div>
                ))}
              </div>

              <a 
                href="https://console.firebase.google.com/project/lms-e-6f847/authentication/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-white text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-2xl"
              >
                Open Console Now <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

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
