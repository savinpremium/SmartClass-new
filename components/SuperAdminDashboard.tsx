
import React, { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, TrendingUp, AlertCircle, Plus, Package as PackageIcon, Shield, Search } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getSystemInsights } from '../services/geminiService';
import { Institution, Package } from '../types';

const data = [
  { name: 'JAN', val: 400 },
  { name: 'FEB', val: 300 },
  { name: 'MAR', val: 600 },
  { name: 'APR', val: 800 },
  { name: 'MAY', val: 500 },
  { name: 'JUN', val: 900 },
];

interface Props {
  institutions: Institution[];
  onAddInstitution: () => void;
  packages?: Package[];
}

const SuperAdminDashboard: React.FC<Props> = ({ institutions, onAddInstitution, packages = [] }) => {
  const [aiInsights, setAiInsights] = useState<string>('SYNCHRONIZING BUSINESS INTELLIGENCE...');
  const [view, setView] = useState<'nodes' | 'packages'>('nodes');

  useEffect(() => {
    getSystemInsights({ institutionsCount: institutions.length, active: 22, revenue: 125000 }).then(setAiInsights);
  }, [institutions]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">System Core</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Global Infrastructure Command | OWNER@2011</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setView(view === 'nodes' ? 'packages' : 'nodes')}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
          >
            {view === 'nodes' ? <PackageIcon size={16} /> : <Building2 size={16} />} 
            {view === 'nodes' ? 'Manage Packages' : 'Manage Nodes'}
          </button>
          <button 
            onClick={onAddInstitution}
            className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Institution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Nodes', value: institutions.length, trend: '+02' },
          { label: 'Verified Reach', value: '45.2K', trend: '+12%' },
          { label: 'Projected ARR', value: '$1.2M', trend: '+8.1%' },
          { label: 'Server Load', value: '18.4%', trend: 'Stable' },
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

      {view === 'nodes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Node Scalability Graph</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Owner Intelligence
              </h3>
              <p className="text-sm font-bold leading-relaxed opacity-90 italic">
                "{aiInsights}"
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={14} /> Verification Queue
              </h3>
              <div className="space-y-4">
                {institutions.filter(i => i.status === 'pending').map((inst, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white uppercase">{inst.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 tracking-widest">{inst.email}</p>
                    </div>
                    <button className="text-blue-500 font-black text-[9px] uppercase tracking-widest hover:underline">Verify</button>
                  </div>
                ))}
                {institutions.filter(i => i.status === 'pending').length === 0 && (
                  <p className="text-[10px] text-slate-600 font-bold text-center py-4">ALL NODES VALIDATED</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { name: 'BASIC', price: 49, students: 200, color: 'bg-slate-900' },
             { name: 'PROFESSIONAL', price: 149, students: 1000, color: 'bg-blue-600 shadow-xl' },
             { name: 'ENTERPRISE', price: 499, students: 5000, color: 'bg-slate-900' }
           ].map((pkg, i) => (
             <div key={i} className={`${pkg.color} border border-white/5 p-10 rounded-[3rem] group hover:-translate-y-2 transition-all`}>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-4">{pkg.name} NODE</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black tracking-tighter">${pkg.price}</span>
                  <span className="text-[10px] font-bold opacity-60">/MONTH</span>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <Users size={14} className="opacity-60" /> 
                    <span>Up to {pkg.students} Students</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <Shield size={14} className="opacity-60" /> 
                    <span>Node Verification Enabled</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <CreditCard size={14} className="opacity-60" /> 
                    <span>Financial Ledger Access</span>
                  </div>
                </div>
                <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${pkg.name === 'PROFESSIONAL' ? 'bg-white text-blue-600 border-white' : 'border-slate-800 text-slate-400 group-hover:border-white group-hover:text-white'}`}>
                  Modify Parameters
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
