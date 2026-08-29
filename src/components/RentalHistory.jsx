import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { addRental, completeRental, cancelRental, deleteRental } from '../lib/data';

const emptyForm = { customerId: '', carId: '', startDate: '', endDate: '' };

function daysBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function fmtRemaining(ms) {
  const abs = Math.abs(ms);
  const totalMin = Math.floor(abs / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function RentalGauge({ rental }) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(rental.startDate).getTime();
  const end = new Date(rental.endDate).getTime();
  const now = Date.now();
  const total = Math.max(end - start, 1);
  const elapsed = Math.min(Math.max(now - start, 0), total);
  const pct = Math.min((elapsed / total) * 100, 100);
  const overdue = now > end;
  const remainingMs = end - now;

  let fillColor = 'var(--green)';
  if (overdue) fillColor = 'var(--red)';
  else if (pct > 80) fillColor = 'var(--amber)';

  return (
    <div>
      <div className="gauge-track">
        <div className="gauge-ticks" />
        <motion.div
          className="gauge-fill"
          style={{ background: fillColor }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="gauge-meta">
        <span>
          {fmtDate(rental.startDate)} → {fmtDate(rental.endDate)}
        </span>
        <b style={{ color: overdue ? 'var(--red)' : undefined }}>
          {overdue ? `overdue by ${fmtRemaining(remainingMs)}` : `${fmtRemaining(remainingMs)} left`}
        </b>
      </div>
    </div>
  );
}

export default function RentalHistory({ rentals, cars, customers }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);
  const carById = useMemo(() => Object.fromEntries(cars.map((c) => [c.id, c])), [cars]);
  const availableCars = cars.filter((c) => c.status === 'available');

  const sorted = [...rentals].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const openNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...emptyForm, startDate: today });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.carId || !form.startDate || !form.endDate) return;
    const car = carById[form.carId];
    const days = daysBetween(form.startDate, form.endDate);
    await addRental({
      customerId: form.customerId,
      carId: form.carId,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      totalPrice: (car?.pricePerDay || 0) * days,
    });
    setModalOpen(false);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Bookings &amp; durations</span>
          <h2>Rental History</h2>
        </div>
        <button className="btn btn-primary" onClick={openNew} disabled={availableCars.length === 0}>
          <Plus size={15} /> New rental
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">No rentals recorded yet.</div>
      ) : (
        <div className="list">
          {sorted.map((r) => {
            const customer = customerById[r.customerId];
            const car = carById[r.carId];
            return (
              <div className="rental-card" key={r.id}>
                <div className="rental-top">
                  <div className="rental-parties">
                    {customer?.name || 'Unknown customer'}{' '}
                    <span>
                      · {car ? `${car.brand} ${car.model}` : 'car removed'} · {r.totalPrice ? `${r.totalPrice} MAD` : ''}
                    </span>
                  </div>
                  <span className={`status-pill ${r.status}`}>{r.status}</span>
                </div>

                {r.status === 'active' && <RentalGauge rental={r} />}
                {r.status !== 'active' && (
                  <div className="gauge-meta" style={{ marginTop: 0 }}>
                    <span>
                      {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                    </span>
                  </div>
                )}

                <div className="rental-footer">
                  <div />
                  <div className="row-actions">
                    {r.status === 'active' && (
                      <>
                        <button className="btn btn-ghost" onClick={() => completeRental(r.id, r.carId)}>
                          <Check size={14} /> Mark returned
                        </button>
                        <button className="btn btn-danger" onClick={() => cancelRental(r.id, r.carId)}>
                          <X size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {r.status !== 'active' && (
                      <button className="btn btn-ghost icon-btn" onClick={() => deleteRental(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h3>New rental</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Customer</label>
                    <select
                      value={form.customerId}
                      onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                      required
                    >
                      <option value="">Select customer…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Car (available only)</label>
                    <select
                      value={form.carId}
                      onChange={(e) => setForm({ ...form, carId: e.target.value })}
                      required
                    >
                      <option value="">Select car…</option>
                      {availableCars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.model} · {c.pricePerDay || 0} MAD/day
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Start date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>End date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {customers.length === 0 && (
                  <p style={{ color: 'var(--ink-dim)', fontSize: 12.5 }}>
                    Add a customer first from the Customers tab.
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Start rental
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
