import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, List, PieChart, PlusCircle, Settings, RefreshCw } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';
import AddTransactionModal from './components/AddTransactionModal';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { processRecurringTransactions } from './services/recurringService';
import { applyTheme, getTheme } from './utils/theme';


// Components
const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`
    }
  >
    <Icon size={24} />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Process recurring transactions on app load
  useEffect(() => {
    // Apply saved theme
    applyTheme(getTheme());

    // Process recurring transactions
    processRecurringTransactions().catch(err => {
      console.error('Error processing recurring transactions:', err);
    });
  }, []);

  // PWA Update Logic
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">

        {/* Update Notification Toast */}
        {needRefresh && (
          <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-2">
            <div className="bg-primary text-white p-4 rounded-2xl shadow-xl flex justify-between items-center">
              <span className="font-medium text-sm">Je dostupná nová verze!</span>
              <button
                onClick={() => updateServiceWorker(true)}
                className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Aktualizovat
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 safe-area-bottom">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[80px] pb-5 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
          <div className="flex justify-around items-center h-full px-4 relative">
            <NavItem to="/" icon={Home} label="Přehled" />
            <NavItem to="/transactions" icon={List} label="Transakce" />

            {/* FAB for Quick Add - High Contrast */}
            <div className="relative -top-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark transition-transform active:scale-95 flex items-center justify-center"
                aria-label="Přidat transakci"
              >
                <PlusCircle size={32} strokeWidth={2.5} />
              </button>
            </div>

            <NavItem to="/analytics" icon={PieChart} label="Analýza" />
            <NavItem to="/settings" icon={Settings} label="Nastavení" />
          </div>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
