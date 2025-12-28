
import React, { useState } from 'react';
import { Search, UserPlus, MoreVertical, QrCode, Download, Filter, X, CreditCard, ChevronRight, Globe } from 'lucide-react';
import { Student } from '../types';

interface Props {
  students: Student[];
  onAddStudent: (student: Partial<Student>) => void;
}

const StudentManagement: React.FC<Props> = ({ students, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Registry</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Personnel Management Authority</p>
        </div>
        <button 
          className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Enroll Personnel
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="SEARCH REGISTRY BY NAME OR ID..." 
            className="w-full pl-16 pr-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-black tracking-[0.1em] text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identified Personnel</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">System Identifier</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center font-black">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-black text-white tracking-tight">{student.name.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                      {student.id}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-bold text-slate-500 text-sm uppercase tracking-widest">{student.grade}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black tracking-widest uppercase">Verified</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="p-3 bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg"
                        title="Generate Access Key"
                      >
                        <QrCode size={18} />
                      </button>
                      <button className="p-3 text-slate-600 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0f172a] rounded-[4rem] border border-white/5 w-full max-w-lg p-12 text-center relative shadow-[0_0_100px_rgba(30,64,175,0.2)]">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-10 right-10 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">Credentials Preview</h3>
            
            <div className="bg-gradient-to-br from-blue-700 to-indigo-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group mb-10 text-left border border-white/10">
               <div className="absolute top-0 right-0 p-8">
                 {/* Fixed: Added missing Globe import */}
                 <Globe className="text-white/20" size={40} />
               </div>
               
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedStudent.id}&bgcolor=ffffff`} 
                      className="w-full h-full p-4"
                      alt="ID QR"
                    />
                 </div>
                 <div>
                   <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{selectedStudent.name}</h4>
                   <p className="text-blue-200 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{selectedStudent.grade} | Personnel</p>
                 </div>
               </div>
               
               <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                 <div>
                   <p className="text-white/40 font-black text-[9px] uppercase tracking-widest mb-1">Access Identifier</p>
                   <p className="font-mono text-white text-sm font-bold">{selectedStudent.id}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-white/40 font-black text-[9px] uppercase tracking-widest mb-1">Institutional Host</p>
                   <p className="text-white text-xs font-black uppercase tracking-widest">SMARTCLASS.LK</p>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex-1 bg-white text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-200 transition-all">
                <Download size={18} /> Export PDF
              </button>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-widest text-xs"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
