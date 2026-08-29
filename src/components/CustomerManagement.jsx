import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { addCustomer, updateCustomer, deleteCustomer } from '../lib/data';

const emptyForm = { name: '', phone: '', email: '', licenseNumber: '', address: '' };

export default function CustomerManagement({ customers }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      licenseNumber: customer.licenseNumber || '',
      address: customer.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await updateCustomer(editingId, form);
    } else {
      await addCustomer(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Remove this customer record?')) await deleteCustomer(id);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Customer records</span>
          <h2>Customer Management</h2>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Add customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">No customers yet. Add the first one to get started.</div>
      ) : (
        <div className="list">
          {customers.map((c) => (
            <div className="row-card" key={c.id}>
              <div className="row-main">
                <div className="row-title">{c.name}</div>
                <div className="row-sub">
                  {c.phone && <>📞 {c.phone} &nbsp;</>}
                  {c.email && <>· {c.email} &nbsp;</>}
                  {c.licenseNumber && <>· Lic. {c.licenseNumber}</>}
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-ghost icon-btn" onClick={() => openEdit(c)}>
                  <Pencil size={15} />
                </button>
                <button className="btn btn-danger icon-btn" onClick={() => handleDelete(c.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
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
                <h3>{editingId ? 'Edit customer' : 'New customer'}</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label>Full name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Omar El Amrani"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+212 6 00 00 00 00"
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@email.com"
                    />
                  </div>
                  <div className="field">
                    <label>License number</label>
                    <input
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="AB123456"
                    />
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="City, street"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Save changes' : 'Add customer'}
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
