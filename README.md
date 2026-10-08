# Porcelain Dental Studio — Appointment Booking System

A simple dentist appointment booking flow with a medical-inspired design.

- **Frontend:** React + Vite, deployed on **Vercel**
- **Backend:** Node.js + Express, deployed on **Render**
- **Flow:** Service → Date & time → Patient details → Confirmation (with reference code + calendar download)
- Booking data persists to a JSON file (Render disk) so appointments survive restarts and redeploys.

## Project structure

```
├─ client/          React frontend (Vite)
│  └─ src/
│     ├─ App.jsx           flow state + step routing
│     ├─ api.js            fetch wrappers
│     ├─ lib.js            date formatting + .ics download
│     └─ steps/            ServiceStep · TimeStep · DetailsStep · ConfirmationStep
├─ server/          Express API
│  ├─ index.js            routes
│  └─ store.js            services, slot generation, validation, persistence
└─ render.yaml      Render service definition
```

## API

| Method | Route                  | Description                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/api/health`          | Liveness check                                   |
| GET    | `/api/services`        | List of treatments with duration and price       |
| GET    | `/api/slots?date=YYYY-MM-DD` | Available times for a date (taken/past flagged) |
| POST   | `/api/appointments`    | Create a booking (validates + prevents double-book) |
| GET    | `/api/appointments/:reference` | Look up a booking by reference (e.g. `PD-ABC123`) |

Slot rules: Mon–Fri 09:00–17:00, Sat 09:00–13:00, closed Sunday, lunch break 12:30–13:30 weekdays, bookings up to 30 days ahead, past slots excluded.

## Run locally

Backend:

```bash
cd server
npm install
npm run dev        # http://localhost:4000
```

Frontend (separate terminal):

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:4000` during development. The client falls back to the same origin for `/api` when `VITE_API_URL` is not set.

## Deploy

### Backend on Render

1. Push the repo to GitHub/GitLab.
2. Render → New → Blueprint, select the repo.
3. Render reads `render.yaml`, creates the web service (`node`, `npm start`, health check at `/api/health`) and attaches a 1 GB disk mounted at `/var/data`, which the API uses to store appointments.
4. Note the service URL, e.g. `https://porcelain-dental-api.onrender.com`.

No special config — persistence, start command, and health check are already wired in `render.yaml`.

### Frontend on Vercel

1. Push the repo, then in Vercel import `client/` as the project root.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. Add environment variable for the backend URL:

   ```
   VITE_API_URL = https://porcelain-dental-api.onrender.com
   ```

   Add it **before** the first build (Vite bakes it in at build time), and re-deploy if you change it later.

4. Deploy. The site calls the Render API directly.

### Manual (no Render blueprint)

`render.yaml` is optional — a plain Render web service set to `npm install` / `npm start` in `server/` works the same, just add the `DATA_DIR` env var pointing at an attached disk.

## Local storage caveat

Appointments are stored in a JSON file on the Render disk. The free plan keeps the disk between restarts but not guaranteed forever; for a "real" production booking system you'd swap `store.js` persistence for a Postgres database (Render offers a free tier).