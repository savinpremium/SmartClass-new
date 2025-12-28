
import React, { useState } from 'react';
import { CheckCircle, Shield, Building2, Mail, Loader2, Send, TriangleAlert, FileText } from 'lucide-react';
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

  const nextStep = () => {
    setError(null);
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const handleFirebaseVerification = async () => {
    if (!formData.email || formData.password.length < 6) {
      setError("Please enter a correct email and password (at least 6 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerAndVerifyInstitution(formData.email, formData.password);
      nextStep();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              ${step >= s ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 border border-slate-700'}
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
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Step 1: School Info</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Basic school setup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">School Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all"
                  placeholder="Example: Global School"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Owner ID (NIC)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all"
                  value={formData.nic}
                  onChange={e => setFormData({...formData, nic: e.target.value})}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none transition-all"
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Full Address</label>
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
            
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Step 2: Login Details</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-12">Setup your school admin account</p>
            
            <div className="w-full max-w-sm space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Login Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
                  placeholder="admin@myschool.lk"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Set Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
                  placeholder="Choose a strong password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex flex-col items-start gap-4 text-left animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <TriangleAlert size={18} /> Error
                  </div>
                  <p className="text-rose-200/80 text-xs font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <button 
                onClick={handleFirebaseVerification}
                disabled={loading || !formData.email || formData.password.length < 6}
                className={`
                  w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all
                  ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-[0.98]'}
                `}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <Send size={16} /> Save Admin Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 md:p-16">
             <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <FileText className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Step 3: Agreements</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Read carefully before activation</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 mb-10 text-[11px] font-mono text-slate-400 space-y-6 max-h-80 overflow-y-auto custom-scrollbar">
               <h4 className="text-white font-black uppercase border-b border-slate-800 pb-2">Terms & Conditions for Institution Registration</h4>
               
               <p>1. ELIGIBILITY & AUTHORITY: The person registering confirms they are the legal owner or authorized representative. NIC provided must belong to the authorized person.</p>
               
               <p>2. REGISTRATION & VERIFICATION: Requires valid NIC, phone number, and OTP verification. The Owner reserves the right to approve, reject, or suspend any school at any time.</p>
               
               <p>3. DIGITAL AGREEMENT: Acceptance of these Terms constitutes a legally binding digital agreement enforceable under electronic transaction laws.</p>
               
               <p>4. USE OF THE PLATFORM: Institutions may use the platform only for legal educational purposes. No misuse, unauthorized access, or tampering allowed.</p>
               
               <p>5. DATA RESPONSIBILITY: Institutions are responsible for accuracy of student, parent, and payment data. The Owner does not verify this data.</p>
               
               <p>6. PRIVACY & HANDLING: The Owner is not liable for data entered incorrectly or misused by institution staff.</p>
               
               <p>7. PAYMENTS & FEES: Fees may change. Non-payment leads to feature limitation or suspension. Owner is not responsible for school-student disputes.</p>
               
               <p>8. ATTENDANCE & QR: QR codes are for identification. Owner does not guarantee prevention of misuse.</p>
               
               <p>9. SYSTEM AVAILABILITY: Platform is "as is". 100% uptime is not guaranteed.</p>
               
               <p>10. LIMITATION OF LIABILITY: Owner is not liable for data loss, financial loss, or legal disputes. Use at your own risk.</p>
               
               <p>11. SUSPENSION: Access may be revoked for violations or security reasons.</p>
               
               <p>12. MODIFICATIONS: Owner may update terms at any time. Continued use means acceptance.</p>
               
               <p>13. GOVERNING LAW: Disputes resolved by Owner's chosen legal authority.</p>
               
               <p>14. ENTIRE AGREEMENT: These Terms override all prior agreements.</p>
               
               <p>15. ACCEPTANCE: By completing registration, you confirm agreement to all 15 points and legal authority to bind the school.</p>
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
                I have read and agree to all 15 points of the terms above.
              </span>
            </label>
          </div>
        )}

        <div className="p-8 md:px-16 md:pb-16 flex justify-between gap-6">
          <button 
            onClick={step === 1 ? onCancel : prevStep}
            className="px-10 py-4 bg-slate-900 text-slate-400 border border-slate-800 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white transition-all active:scale-[0.98]"
          >
            {step === 1 ? 'Cancel' : 'Go Back'}
          </button>
          <button 
            onClick={step === 3 ? handleFinish : (step === 2 ? handleFirebaseVerification : nextStep)}
            disabled={step === 1 && !formData.name}
            className={`
              px-12 py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl transition-all active:scale-95
              ${(step === 3 && !formData.agreementAccepted) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200'}
            `}
          >
            {step === 3 ? 'Activate Now' : 'Next Step'}
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
