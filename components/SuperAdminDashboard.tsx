
import React, { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, TrendingUp, AlertCircle, Plus, Package as PackageIcon, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getSystemInsights } from '../services/geminiService';
import { Institution, Package } from '../types';

const growthData = [
  { name: 'JAN', val: 0 },
  { name: 'FEB', val: 2 },
  { name: 'MAR', val: 5 },
  { name: 'APR', val: 8 },
  { name: 'MAY', val: 12 },
  { name: 'JUN', val: 20 },
];

interface Props {
  institutions: Institution[];
  onAddInstitution: () => void;
  packages?: Package[];
}

const SuperAdminDashboard: React.FC<Props> = ({ institutions, onAddInstitution, packages = [] }) => {
  const [aiInsights, setAiInsights] = useState<string>('Analyzing system performance...');
  const [view, setView] = useState<'schools' | 'plans'>('schools');

  useEffect(() => {
    getSystemInsights({ schoolCount: institutions.length, active: institutions.filter(i => i.verified).length }).then(setAiInsights);
  }, [institutions]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">System Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Smart Class System Portal | Owner Access</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setView(view === 'schools' ? 'plans' : 'schools')}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
          >
            {view === 'schools' ? <PackageIcon size={16} /> : <Building2 size={16} />} 
            {view === 'schools' ? 'View Plans' : 'View Schools'}
          </button>
          <button 
            onClick={onAddInstitution}
            className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Add New School
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Schools', value: institutions.length, trend: '+0' },
          { label: 'Total Students', value: '0', trend: '0%' },
          { label: 'Total Income', value: 'LKR 0', trend: '0%' },
          { label: 'System Uptime', value: '100%', trend: 'Stable' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {view === 'schools' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Growth Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> AI Updates
              </h3>
              <p className="text-sm font-bold leading-relaxed opacity-90 italic">
                "{aiInsights}"
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={14} /> Pending Approval
              </h3>
              <div className="space-y-4">
                {institutions.filter(i => !i.verified).map((inst, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white uppercase">{inst.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 tracking-widest">{inst.email}</p>
                    </div>
                    <button className="text-blue-500 font-black text-[9px] uppercase tracking-widest hover:underline">Approve</button>
                  </div>
                ))}
                {institutions.filter(i => !i.verified).length === 0 && (
                  <p className="text-[10px] text-slate-600 font-bold text-center py-4">No schools waiting</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {packages.map((pkg, i) => (
             <div key={i} className={`${pkg.name.includes('Core') ? 'bg-blue-600 shadow-xl' : 'bg-slate-900'} border border-white/5 p-10 rounded-[3rem] group hover:-translate-y-2 transition-all`}>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-4">{pkg.name.toUpperCase()}</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black tracking-tighter">${pkg.price}</span>
                  <span className="text-[10px] font-bold opacity-60">/MONTH</span>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <Users size={14} className="opacity-60" /> 
                    <span>Up to {pkg.studentLimit} Students</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <Shield size={14} className="opacity-60" /> 
                    <span>Full Security</span>
                  </div>
                </div>
                <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${pkg.name.includes('Core') ? 'bg-white text-blue-600 border-white' : 'border-slate-800 text-slate-400 group-hover:border-white group-hover:text-white'}`}>
                  Manage Plan
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
