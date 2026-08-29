import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { addCar, updateCar, deleteCar } from '../lib/data';
import CarGPS from './CarGPS.jsx';

const emptyForm = { brand: '', model: '', year: '', plate: '', pricePerDay: '' };

export default function CarManagement({ cars }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (car) => {
    setEditingId(car.id);
    setForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      plate: car.plate || '',
      pricePerDay: car.pricePerDay || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim()) return;
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : 0,
    };
    if (editingId) {
      await updateCar(editingId, payload);
    } else {
      await addCar(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Remove this car from the fleet?')) await deleteCar(id);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Fleet inventory</span>
          <h2>Car Management</h2>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Add car
        </button>
      </div>

      {cars.length === 0 ? (
        <div className="empty-state">No cars in the fleet yet. Add one to start renting.</div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <motion.div
              layout
              key={car.id}
              className="car-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="car-card-body">
                <div className="car-top-row">
                  <div>
                    <div className="car-name">
                      {car.brand} {car.model}
                    </div>
                    {car.year && <div className="car-year">{car.year}</div>}
                  </div>
                  <span className={`status-chip ${car.status === 'rented' ? 'rented' : 'available'}`}>
                    {car.status === 'rented' ? 'Rented' : 'Available'}
                  </span>
                </div>

                {car.plate && (
                  <div className="plate">
                    <span>{car.plate}</span>
                    <span>PLATE</span>
                  </div>
                )}

                <div className="price-tag">
                  <b>{car.pricePerDay ? `${car.pricePerDay} MAD` : '—'}</b> / day
                </div>

                <CarGPS car={car} />

                <div className="car-card-actions">
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => openEdit(car)}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="btn btn-danger icon-btn" onClick={() => handleDelete(car.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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
                <h3>{editingId ? 'Edit car' : 'New car'}</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label>Brand</label>
                    <input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="Renault"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Model</label>
                    <input
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="Clio"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Year</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      placeholder="2022"
                    />
                  </div>
                  <div className="field">
                    <label>Plate number</label>
                    <input
                      value={form.plate}
                      onChange={(e) => setForm({ ...form, plate: e.target.value })}
                      placeholder="12345-A-6"
                    />
                  </div>
                  <div className="field">
                    <label>Price / day (MAD)</label>
                    <input
                      type="number"
                      value={form.pricePerDay}
                      onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                      placeholder="350"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Save changes' : 'Add car'}
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
