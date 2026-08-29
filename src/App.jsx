import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Car, ClipboardList } from 'lucide-react';
import { subscribeCustomers, subscribeCars, subscribeRentals } from './lib/data';
import CustomerManagement from './components/CustomerManagement.jsx';
import CarManagement from './components/CarManagement.jsx';
import RentalHistory from './components/RentalHistory.jsx';

const TABS = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'rentals', label: 'Rentals', icon: ClipboardList },
];

export default function App() {
  const [tab, setTab] = useState('cars');
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const unsubs = [
      subscribeCustomers(setCustomers),
      subscribeCars(setCars),
      subscribeRentals(setRentals),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const activeRentals = rentals.filter((r) => r.status === 'active').length;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">FD</div>
          <div>
            <h1>FleetDesk</h1>
            <span className="tag">rental fleet control</span>
          </div>
        </div>
        <div className="header-stats">
          <div>
            <b>{cars.length}</b>Cars
          </div>
          <div>
            <b>{customers.length}</b>Customers
          </div>
          <div>
            <b>{activeRentals}</b>Active
          </div>
        </div>
      </header>

      <nav className="tab-tray">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  style={{ left: 0, right: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={15} />
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {tab === 'customers' && <CustomerManagement customers={customers} />}
          {tab === 'cars' && <CarManagement cars={cars} />}
          {tab === 'rentals' && (
            <RentalHistory rentals={rentals} cars={cars} customers={customers} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
