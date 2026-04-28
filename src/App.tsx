/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock,
  FileText, 
  LineChart, 
  FileBarChart, 
  RefreshCw, 
  Cloud, 
  Search,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Plus,
  Bell,
  Settings,
  LogIn,
  Ticket,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils.ts';
import { Modal } from './components/Modal.tsx';
import { useFemicState } from './hooks/useFemicState.ts';
import { Patient } from './types.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { Patients } from './components/Patients.tsx';
import { Agenda } from './components/Agenda.tsx';
import { Analysis } from './components/Analysis.tsx';
import { Reports } from './components/Reports.tsx';
import { Documents } from './components/Documents.tsx';
import { Import } from './components/Import.tsx';
import { Backup } from './components/Backup.tsx';
import { Settings as SettingsView } from './components/Settings.tsx';
import { Packages } from './components/Packages.tsx';
import { Reminders } from './components/Reminders.tsx';
import { AppointmentModal } from './components/AppointmentModal.tsx';
import { supabase } from './lib/supabase.ts';
import { DailyView } from './components/DailyView.tsx';

type Page = 'dashboard' | 'patients' | 'agenda' | 'daily' | 'packages' | 'reminders' | 'documents' | 'analysis' | 'reports' | 'import' | 'backup' | 'settings';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();

  // Global State
  const state = useFemicState();

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6", theme === 'light' ? 'bg-slate-50' : 'bg-slate-950')}>
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Cloud size={32} />
          </div>
          <h2 className="text-xl font-bold dark:text-white">Configuração Pendente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            As chaves do <b>Supabase</b> não foram encontradas. <br/><br/>
            Se você está no GitHub Pages, adicione <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> em <b>Settings &gt; Secrets and Variables &gt; Actions</b>.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-[10px] font-mono text-slate-400 break-all">
            URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ OK' : '❌ Faltando'}<br/>
            Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ OK' : '❌ Faltando'}
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleOpenApptModal = (date?: string, slot?: string, appt?: any) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setEditingAppt(appt);
    setIsApptModalOpen(true);
  };

  const handleOpenPatientModal = (patient?: Patient) => {
    setEditingPatient(patient || null);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingPatient) {
      await state.updatePatient(editingPatient.id, {
        name: data.name as string,
        pathology: data.pathology as string,
        whatsapp: data.whatsapp as string
      });
    } else {
      await state.addPatient({
        name: data.name as string,
        pathology: data.pathology as string,
        whatsapp: data.whatsapp as string,
        archived: false,
        created_at: new Date().toISOString()
      });
    }
    
    setIsPatientModalOpen(false);
  };

  if (!state.user && !state.isLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 transition-colors duration-300", theme === 'light' ? 'bg-slate-50' : 'bg-slate-950')}>
        <div className={cn(
          "max-w-md w-full p-12 rounded-[40px] border text-center space-y-8",
          theme === 'light' ? "bg-white border-slate-100 shadow-2xl shadow-slate-200" : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/40"
        )}>
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-blue-500/20">
                <div className="w-10 h-10 bg-white rounded-full"></div>
             </div>
             <h1 className={cn("text-4xl font-black tracking-tighter", theme === 'light' ? "text-slate-800" : "text-white")}>
               FEMIC <span className="text-blue-500">PRO</span>
             </h1>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">Plataforma de Gestão Clínica para <br/> Fisioterapeutas de Elite</p>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
          >
            <LogIn size={20} /> Entrar com Google
          </button>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">Seguro pela Google Cloud Technology</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'daily', label: 'Dia', icon: Clock },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'packages', label: 'Pacotes', icon: Ticket },
    { id: 'reminders', label: 'Lembretes', icon: MessageSquare },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'analysis', label: 'Análise', icon: LineChart },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    { id: 'import', label: 'Sincronização', icon: RefreshCw },
    { id: 'backup', label: 'Backup', icon: Cloud },
  ];

  const currentThemeClasses = theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100';

  const renderContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
           <RefreshCw size={48} className="text-blue-500 animate-spin opacity-20" />
        </div>
      )
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard theme={theme} state={state} />;
      case 'patients': return <Patients theme={theme} onAddClick={() => handleOpenPatientModal()} onEditClick={handleOpenPatientModal} state={state} />;
      case 'agenda': return <Agenda theme={theme} state={state} onAddClick={handleOpenApptModal} onEditClick={(appt) => handleOpenApptModal(undefined, undefined, appt)} />;
      case 'daily': return <DailyView theme={theme} state={state} onEditClick={(appt) => handleOpenApptModal(undefined, undefined, appt)} />;
      case 'packages': return <Packages theme={theme} state={state} />;
      case 'reminders': return <Reminders theme={theme} state={state} />;
      case 'analysis': return <Analysis theme={theme} state={state} />;
      case 'reports': return <Reports theme={theme} state={state} />;
      case 'documents': return <Documents theme={theme} state={state} />;
      case 'import': return <Import theme={theme} state={state} />;
      case 'backup': return <Backup theme={theme} state={state} />;
      case 'settings': return <SettingsView theme={theme} state={state} />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            <Plus size={48} className="opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-300 dark:text-slate-800 uppercase tracking-tighter">Página em Construção</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">{activePage}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={cn("flex h-screen w-full font-sans overflow-hidden transition-colors duration-300", currentThemeClasses)}>
      {/* Sidebar Navigation */}
      <aside className={cn(
        "bg-slate-900 flex flex-col transition-all duration-300 z-50",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          {isSidebarOpen && (
            <h1 className="text-white font-bold text-xl tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
              FEMIC <span className="text-blue-400">Pro</span>
            </h1>
          )}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                activePage === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", activePage === item.id ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase font-black tracking-widest">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-sm font-medium"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {isSidebarOpen && <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-100/40 hover:text-red-400 hover:bg-red-950/20 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle Sidebar Button (Desktop) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm z-[60] hover:bg-slate-50 transition-colors"
        >
          <ChevronRight size={14} className={cn("transition-transform duration-300", isSidebarOpen && "rotate-180")} />
        </button>

        {/* Header */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-8 shrink-0 z-40 transition-colors duration-300",
          theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
        )}>
          <div>
            <h2 className={cn("text-lg font-bold tracking-tight uppercase", theme === 'light' ? "text-slate-800" : "text-white")}>
              {navItems.find(i => i.id === activePage)?.label}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <input 
                type="text" 
                placeholder="Buscar em todo sistema..." 
                className={cn(
                  "border-none rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner",
                  theme === 'light' ? "bg-slate-100 placeholder-slate-400" : "bg-slate-800 placeholder-slate-500 text-white"
                )}
              />
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActivePage('settings')}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  theme === 'light' ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                <Settings size={20} />
              </button>
              
              <button className={cn(
                "p-2 rounded-xl transition-colors relative",
                theme === 'light' ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}>
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              <div className={cn("flex items-center gap-3 pl-6 border-l", theme === 'light' ? "border-slate-200 text-slate-800" : "border-slate-800 text-white")}>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black leading-none">{state.user?.user_metadata?.full_name || state.user?.user_metadata?.name || 'Usuário'}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span> FISIO
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl shadow-lg shadow-blue-500/10 overflow-hidden bg-slate-200 shrink-0 border border-white dark:border-slate-800 rotate-3 group hover:rotate-0 transition-transform">
                  <img src={state.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user?.email}`} alt="avatar" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isPatientModalOpen && (
          <Modal 
            isOpen={isPatientModalOpen} 
            onClose={() => setIsPatientModalOpen(false)} 
            title={editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            theme={theme}
            size="sm"
          >
            <form onSubmit={handleSavePatient} className="space-y-6">
              <div className="space-y-4">
                <div className="field">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Nome Completo</label>
                  <input 
                    name="name"
                    defaultValue={editingPatient?.name}
                    required
                    type="text" 
                    placeholder="João Silva"
                    className={cn(
                      "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                      theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                    )}
                  />
                </div>
                <div className="field">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">WhatsApp</label>
                  <input 
                    name="whatsapp"
                    defaultValue={editingPatient?.whatsapp}
                    required
                    type="tel" 
                    placeholder="(11) 99999-9999"
                    className={cn(
                      "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                      theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                    )}
                  />
                </div>
                <div className="field">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Patologia</label>
                  <input 
                    name="pathology"
                    defaultValue={editingPatient?.pathology}
                    type="text" 
                    placeholder="Ex: Cervicalgia"
                    className={cn(
                      "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                      theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className={cn(
                    "flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all border",
                    theme === 'light' ? "bg-white border-slate-200 text-slate-500" : "bg-slate-800 border-slate-700 text-slate-400"
                  )}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </Modal>
        )}

        {isApptModalOpen && (
          <AppointmentModal
            isOpen={isApptModalOpen}
            onClose={() => setIsApptModalOpen(false)}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            editingAppointment={editingAppt}
            theme={theme}
            state={state}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

