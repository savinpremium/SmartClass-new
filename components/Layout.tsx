
import React, { useState } from 'react';
import { Menu, X, LogOut, User, Globe, ChevronRight } from 'lucide-react';
import { UserRole } from '../types';
import { NAV_ITEMS } from '../constants';

interface LayoutProps {
  user: { role: UserRole; name: string } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, activeTab, setActiveTab, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const items = NAV_ITEMS[user.role];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-out
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Globe className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white uppercase">
                SmartClass<span className="text-blue-500">.lk</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">System Hub</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-4 mb-2 bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 border border-slate-600">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                  {user.role === UserRole.SUPER_ADMIN ? 'System Owner' : 'School Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800 h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <button 
            className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 flex items-center justify-end space-x-6">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Live Connection</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
