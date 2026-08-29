# FleetDesk — Rental Car Manager

React + Vite app for managing a car rental business, backed by Firebase Realtime Database.

## Features

- **Customer Management** — add, edit, delete customer records (name, phone, email, license, address).
- **Car Management** — brand/model/year/plate/price per day, live status (available/rented).
- **GPS readout per car** — formatted lat/lng, "last seen" freshness, one-tap Google Maps link, and a "Set from this device" button that uses the browser's geolocation to write a fix straight to Firebase (handy for tagging a car's last known location from a phone left in it, or from a driver's device).
- **Rental History** — book a rental (picks from *available* cars only), auto-computes total price, and shows a live countdown gauge for each active rental (green → amber near the deadline → red once overdue). Mark returned / cancel updates the car's status automatically.
- **Framer Motion** throughout: animated tab indicator, panel transitions, modal enter/exit, and the countdown gauge fill.

## Setup

```bash
npm install
npm run dev
```

Your Firebase config is already wired up in `src/lib/firebase.js` (the values you shared — a Firebase **web config is not a secret**, it's fine to ship in client code; access control is enforced by your Realtime Database security rules, not by hiding this object).

## Data model (Realtime Database)

```
customers/{id}   { name, phone, email, licenseNumber, address, createdAt }
cars/{id}        { brand, model, year, plate, pricePerDay, status, gps: { lat, lng, updatedAt } }
rentals/{id}     { customerId, carId, startDate, endDate, totalPrice, status, createdAt }
```

`status` on a car is `"available"` or `"rented"`. `status` on a rental is `"active"`, `"completed"`, or `"cancelled"` — starting/returning/cancelling a rental automatically flips the linked car's status.

## Suggested security rules (start here, then tighten with Auth)

The app currently reads/writes with no authentication. That's fine for local testing, but before this goes anywhere public, lock down the database. In the Firebase console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

That requires *some* signed-in user (add Firebase Auth — even anonymous auth — to satisfy it). If you want it open only while you're actively developing, keep test-mode rules but set an expiry date in the console, never ship a production app with fully public read/write rules.

## Project structure

```
src/
  lib/
    firebase.js     Firebase init (Realtime Database)
    data.js         CRUD + subscribe helpers for customers/cars/rentals
  components/
    CustomerManagement.jsx
    CarManagement.jsx
    CarGPS.jsx        per-car GPS readout + manual location set
    RentalHistory.jsx  booking form + live countdown gauge
  App.jsx           tab navigation + animated transitions
  index.css         design tokens (dark "garage dashboard" theme)
```
