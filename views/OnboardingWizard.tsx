
import React, { useState } from 'react';
import { CheckCircle, Shield, Building2, Mail, Loader2, Send, FileText, X } from 'lucide-react';
import { registerAndVerifyInstitution } from '../lib/firebase';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const validateStep1 = () => formData.name && formData.nic && formData.contact;
  const validateStep2 = () => formData.email && formData.password.length >= 6;

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      setError("Please complete all school information fields.");
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const handleRegistration = async () => {
    if (!validateStep2()) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerAndVerifyInstitution(formData.email, formData.password);
      nextStep();
    } catch (err: any) {
      setError(err.message || "Security Gate: Registration failed. Please try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (formData.agreementAccepted) {
      setLoading(true);
      try {
        await onComplete(formData);
      } catch (e) {
        setError("Database write failed. Security check failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-16 px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= s ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-slate-800 text-slate-500'}`}>
              {step > s ? <CheckCircle size={20} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-700 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-[#0a101f] rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        
        {step === 1 && (
          <div className="p-12 md:p-16">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Institution Profile</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Step 1: Core Identification</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Institution Name</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Owner NIC / ID</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500" value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Primary Contact</label>
                <input type="tel" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-12 md:p-16 text-center">
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 mx-auto mb-8">
              <Mail className="text-blue-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-10">Admin Access</h2>
            <div className="max-w-sm mx-auto space-y-6 text-left">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Secure Email</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" placeholder="admin@school.lk" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Master Password</label>
                <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              {error && <p className="text-rose-500 text-[9px] font-black uppercase text-center">{error}</p>}
              <button onClick={handleRegistration} disabled={loading} className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-[10px] text-white flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={16} />} Create Account
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 md:p-16">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Activation</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Step 3: Legal Compliance</p>
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 mb-8 text-[11px] font-medium text-slate-400 leading-relaxed">
               <p className="mb-4 text-white font-black uppercase italic">Service Level Agreement (SLA)</p>
               <p>By activating this school hub, you agree that data stored is the property of your institution. SmartClass.lk provides encryption and hosting services only. You are responsible for ensuring student data privacy under your local laws.</p>
            </div>
            <label className="flex items-center gap-4 cursor-pointer p-6 bg-slate-950 rounded-3xl border border-slate-800 hover:border-blue-500 transition-all">
               <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${formData.agreementAccepted ? 'bg-blue-600 border-blue-600' : 'border-slate-700'}`}>
                 {formData.agreementAccepted && <CheckCircle size={14} className="text-white" />}
               </div>
               <input type="checkbox" className="hidden" checked={formData.agreementAccepted} onChange={e => setFormData({...formData, agreementAccepted: e.target.checked})} />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">I certify that I am the authorized owner of this institution.</span>
            </label>
          </div>
        )}

        <div className="p-8 md:px-16 md:pb-16 flex justify-between gap-4">
           <button onClick={step === 1 ? onCancel : prevStep} className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[9px]">
             {step === 1 ? 'Cancel' : 'Back'}
           </button>
           {step !== 2 && (
             <button onClick={step === 3 ? handleFinish : nextStep} disabled={loading} className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[9px] shadow-2xl flex items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={12} />}
                {step === 3 ? 'Finalize & Activate' : 'Continue'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
