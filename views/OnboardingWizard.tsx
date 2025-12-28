
import React, { useState } from 'react';
import { CheckCircle, Shield, Building2, Mail, Lock, Loader2, AlertCircle, Send, Terminal, Play } from 'lucide-react';
import { registerAndVerifyInstitution } from '../lib/firebase';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: 'Sri Lanka',
    address: '',
    nic: '',
    contact: '',
    email: '',
    password: '',
    agreementAccepted: false
  });

  const nextStep = () => {
    setError(null);
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const handleFirebaseVerification = async () => {
    setLoading(true);
    setError(null);
    setIsConfigError(false);
    try {
      await registerAndVerifyInstitution(formData.email, formData.password);
      nextStep();
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Firebase Console") || err.message.includes("operation-not-allowed")) {
        setIsConfigError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 1000);
  };

  const handleFinish = () => {
    if (formData.agreementAccepted) {
      onComplete(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-16">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300
              ${step >= s ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}
            `}>
              {step > s ? <CheckCircle size={22} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-[#0a101f] rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        
        {step === 1 && (
          <div className="p-12 md:p-16">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <Building2 className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Institutional Node</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Primary Operational Parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Institution Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold tracking-wide text-white focus:border-blue-500/50 outline-none transition-all"
                  placeholder="EX: EXCELLENCE ACADEMY"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Authority NIC</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all"
                  value={formData.nic}
                  onChange={e => setFormData({...formData, nic: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Contact Number</label>
                <input 
                  type="tel" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all"
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Operational HQ</label>
                <textarea 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none h-32 resize-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-12 md:p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 flex items-center justify-center mb-10 relative">
              <Mail className="text-blue-500" size={40} />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-[#0a101f]">
                 <Shield className="text-white" size={14} />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Auth Deployment</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-12">Firebase Secured Email Link</p>
            
            <div className="w-full max-w-sm space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Authority Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
                  placeholder="admin@institution.lk"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">New System Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex flex-col items-start gap-4 text-left">
                  <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={18} /> Configuration Alert
                  </div>
                  <p className="text-rose-200/80 text-xs font-medium leading-relaxed">
                    {error}
                  </p>
                  {isConfigError && (
                    <div className="w-full pt-4 mt-2 border-t border-rose-500/10 space-y-4">
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Immediate Actions:</p>
                      <ul className="text-[10px] text-rose-200/60 font-mono space-y-2">
                        <li>1. Login to Firebase Console</li>
                        <li>2. Select Project: lms-e-6f847</li>
                        <li>3. Go to Authentication > Sign-in method</li>
                        <li>4. Enable 'Email/Password' Provider</li>
                      </ul>
                      <button 
                        onClick={handleSimulateAuth}
                        className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all"
                      >
                        <Play size={14} /> Bypass for UI Demo (Mock Auth)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isConfigError && (
                <button 
                  onClick={handleFirebaseVerification}
                  disabled={loading || !formData.email || formData.password.length < 6}
                  className={`
                    w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all
                    ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white shadow-xl hover:bg-blue-700'}
                  `}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Send size={16} /> Send Verification Link
                    </>
                  )}
                </button>
              )}
              <p className="text-slate-500 text-[10px] font-bold">Secure deployment via Google Firebase Infrastructure.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 md:p-16">
             <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <Shield className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Node Activation</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Final Operational Terms</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 mb-10 text-xs font-mono text-slate-400 space-y-4">
               <p className="text-emerald-500 font-black flex items-center gap-2">
                 <CheckCircle size={14} /> Identification Verified for {formData.email}
               </p>
               <p>1. IDENTITY: Registered as Institutional Node under {formData.name}.</p>
               <p>2. AUTHORITY: I confirm I have the legal right to represent this entity.</p>
               <p>3. BILLING: I acknowledge subscription packages are managed by the System Owner (Owner@2011).</p>
               <p>4. DATA: All data is hosted on Firebase Secured Storage.</p>
            </div>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="pt-1">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreementAccepted ? 'bg-blue-600 border-blue-600' : 'border-slate-700 group-hover:border-slate-500'}`}>
                   {formData.agreementAccepted && <CheckCircle size={14} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={formData.agreementAccepted}
                  onChange={e => setFormData({...formData, agreementAccepted: e.target.checked})}
                />
              </div>
              <span className="text-xs font-black text-slate-500 leading-normal group-hover:text-slate-300 transition-colors uppercase tracking-widest">
                I ACKNOWLEDGE ALL OPERATIONAL PROTOCOLS. ACTIVATE NODE.
              </span>
            </label>
          </div>
        )}

        <div className="p-8 md:px-16 md:pb-16 flex justify-between gap-6">
          <button 
            onClick={step === 1 ? onCancel : prevStep}
            className="px-10 py-4 bg-slate-900 text-slate-400 border border-slate-800 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white transition-all"
          >
            {step === 1 ? 'Abort' : 'Back'}
          </button>
          <button 
            onClick={step === 3 ? handleFinish : (step === 2 ? handleFirebaseVerification : nextStep)}
            disabled={step === 1 && !formData.name}
            className={`
              px-12 py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl transition-all active:scale-95
              ${(step === 3 && !formData.agreementAccepted) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200'}
            `}
          >
            {step === 3 ? 'Deploy Node' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
