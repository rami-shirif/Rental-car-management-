// Firebase setup for FleetDesk
// Uses the Realtime Database (databaseURL is present in the config),
// so all reads/writes in this app go through firebase/database.

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD_mEgfFs7KBY20rK-rWhSAlzYl3DwPgdk',
  authDomain: 'rental-cars-manager.firebaseapp.com',
  databaseURL: 'https://rental-cars-manager-default-rtdb.firebaseio.com',
  projectId: 'rental-cars-manager',
  storageBucket: 'rental-cars-manager.firebasestorage.app',
  messagingSenderId: '1045564155586',
  appId: '1:1045564155586:web:0b639d74378cdcabda3d5b',
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
