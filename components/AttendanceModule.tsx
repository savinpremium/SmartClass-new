
import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, CheckCircle2, AlertTriangle, Calendar, UserCheck, X } from 'lucide-react';

declare const Html5QrcodeScanner: any;

const AttendanceModule: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);

    // Give the DOM a moment to render the reader div
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-attendance", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText: string) => {
        setScanResult(decodedText);
        stopScanner();
        scanner.clear();
      }, (error: any) => {
        // Handle error silently or log
      });
      
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((e: any) => console.log(e));
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.log(e));
      }
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Presence Entry</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Institutional Roll Call Hub</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 text-slate-300 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]">
          <Calendar size={14} className="text-blue-500" /> 
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/50 backdrop-blur-xl p-12 rounded-[4rem] border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {isScanning && (
            <button 
              onClick={stopScanner}
              className="absolute top-8 right-8 p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors z-50"
            >
              <X size={20} />
            </button>
          )}

          <div className={`
            w-full aspect-square max-w-[320px] rounded-[3rem] relative overflow-hidden mb-12 border-4 transition-all duration-500
            ${isScanning ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-slate-800'}
          `}>
            {isScanning ? (
              <div id="qr-reader-attendance" className="w-full h-full bg-slate-950"></div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                <ScanLine size={64} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scanner Offline</p>
              </div>
            )}
            
            {isScanning && <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2s_infinite]" />}
          </div>

          <div className="w-full max-w-sm">
            <button 
              onClick={startScanner}
              disabled={isScanning}
              className={`
                w-full py-6 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all
                ${isScanning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:-translate-y-1'}
              `}
            >
              <ScanLine size={20} /> {isScanning ? 'Synchronizing Optic' : 'Initialize Scanner'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {scanResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[3rem] animate-in slide-in-from-right-10 duration-500">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-emerald-400 font-black text-xl tracking-tight uppercase">Presence Authorized</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-white font-black text-2xl tracking-tighter">ALICE JOHNSON</p>
                    <p className="text-emerald-500/60 font-mono text-xs uppercase tracking-widest">ID: {scanResult}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">TIMESTAMP: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setScanResult(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <UserCheck size={14} className="text-blue-500" /> Operational Log
            </h3>
            <div className="space-y-4">
              {[
                { name: 'JOHN DOE', time: '08:45 AM', status: 'PRESENT' },
                { name: 'SARAH SMITH', time: '08:42 AM', status: 'PRESENT' },
                { name: 'ROBERT FOX', time: '08:35 AM', status: 'LATE' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-700 group-hover:text-blue-500">
                      {log.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-white tracking-tight">{log.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{log.time}</p>
                    </div>
                  </div>
                  <span className={`
                    text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest border
                    ${log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                  `}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(320px); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceModule;
