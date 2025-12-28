
import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, CheckCircle2, Calendar, UserCheck, X } from 'lucide-react';

declare const Html5QrcodeScanner: any;

const AttendanceModule: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);

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
        // Handle error silently
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
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Attendance Scan</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Scan student ID card to mark present</p>
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
            ${isScanning ? 'border-blue-500 shadow-2xl' : 'border-slate-800'}
          `}>
            {isScanning ? (
              <div id="qr-reader-attendance" className="w-full h-full bg-slate-950"></div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                <ScanLine size={64} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest">Scanner Off</p>
              </div>
            )}
            
            {isScanning && <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-2xl animate-[scan_2s_infinite]" />}
          </div>

          <div className="w-full max-w-sm">
            <button 
              onClick={startScanner}
              disabled={isScanning}
              className={`
                w-full py-6 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all
                ${isScanning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:-translate-y-1'}
              `}
            >
              <ScanLine size={20} /> {isScanning ? 'Scanner Running...' : 'Open Camera Scanner'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {scanResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[3rem] animate-in slide-in-from-right-10 duration-500">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
                  <CheckCircle2 size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-emerald-400 font-black text-xl tracking-tight uppercase">Attendance Marked</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-white font-black text-2xl tracking-tighter">SUCCESSFUL SCAN</p>
                    <p className="text-emerald-500/60 font-mono text-xs uppercase tracking-widest">ID: {scanResult}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">TIME: {new Date().toLocaleTimeString()}</p>
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
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
              <UserCheck size={14} className="text-blue-500" /> Recent Attendance
            </h3>
            <div className="space-y-4">
              <p className="text-[10px] text-slate-600 font-bold text-center py-4">No recent scans to show</p>
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
