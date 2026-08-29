// Thin data-access layer over Firebase Realtime Database.
// Keeps every component free of raw ref()/onValue() plumbing.

import { db } from './firebase';
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  serverTimestamp,
} from 'firebase/database';

const toArray = (snapshotVal) =>
  snapshotVal
    ? Object.entries(snapshotVal).map(([id, value]) => ({ id, ...value }))
    : [];

// ---------- generic subscribe ----------
function subscribe(path, callback) {
  const r = ref(db, path);
  const unsubscribe = onValue(r, (snap) => callback(toArray(snap.val())));
  return unsubscribe;
}

// ---------- customers ----------
export const subscribeCustomers = (cb) => subscribe('customers', cb);

export const addCustomer = (customer) =>
  push(ref(db, 'customers'), { ...customer, createdAt: serverTimestamp() });

export const updateCustomer = (id, patch) =>
  update(ref(db, `customers/${id}`), patch);

export const deleteCustomer = (id) => remove(ref(db, `customers/${id}`));

// ---------- cars ----------
export const subscribeCars = (cb) => subscribe('cars', cb);

export const addCar = (car) =>
  push(ref(db, 'cars'), {
    status: 'available',
    gps: { lat: null, lng: null, updatedAt: null },
    ...car,
  });

export const updateCar = (id, patch) => update(ref(db, `cars/${id}`), patch);

export const updateCarGPS = (id, lat, lng) =>
  update(ref(db, `cars/${id}/gps`), { lat, lng, updatedAt: Date.now() });

export const deleteCar = (id) => remove(ref(db, `cars/${id}`));

// ---------- rentals ----------
export const subscribeRentals = (cb) => subscribe('rentals', cb);

export const addRental = async (rental) => {
  // rental: { customerId, carId, startDate, endDate, totalPrice, notes }
  const rentalRef = await push(ref(db, 'rentals'), {
    ...rental,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  await update(ref(db, `cars/${rental.carId}`), { status: 'rented' });
  return rentalRef;
};

export const completeRental = async (rentalId, carId) => {
  await update(ref(db, `rentals/${rentalId}`), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
  await update(ref(db, `cars/${carId}`), { status: 'available' });
};

export const cancelRental = async (rentalId, carId) => {
  await update(ref(db, `rentals/${rentalId}`), { status: 'cancelled' });
  await update(ref(db, `cars/${carId}`), { status: 'available' });
};

export const deleteRental = (id) => remove(ref(db, `rentals/${id}`));
