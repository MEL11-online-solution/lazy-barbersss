# Lazy Barbers — Booking System

A full-stack barber booking application with **customer**, **barber**, and **admin** roles.
Built with React + Express + MySQL + Drizzle ORM.

---

## Tech Stack

| Layer            | Technology                                                           |
|------------------|----------------------------------------------------------------------|
| Frontend         | React 18 + Vite + Tailwind CSS + Wouter + React Hook Form + Zod      |
| Backend          | Node.js + Express (REST API)                                         |
| Database         | MySQL 8 + Drizzle ORM                                                |
| Auth             | bcrypt + JWT (httpOnly cookies)                                      |
| SMS              | Provider-swappable (Console / Twilio-ready)                          |
| Email            | Console-based simulation (provider-swappable)                        |
| Infrastructure   | Docker Compose (for local MySQL)                                     |

---

## Prerequisites

- **Node.js** 18 or higher (`node -v` to check)
- **npm** 9 or higher (`npm -v`)
- **Docker Desktop** (for the local MySQL container)

---

## ⚡ Quick Start (5 commands)

```bash
# From the project root:
npm run install:all          # 1. Install root + backend + frontend deps
docker compose up -d         # 2. Start MySQL container
cp backend/.env.example backend/.env   # 3. Set up env file
npm run db:setup             # 4. Run migrations + seed default data
npm run dev                  # 5. Start backend (4000) + frontend (5173)
```

Then open **http://localhost:5173**.

Login as **`admin@lazybarbers.com`** / **`Admin123!`** to access the admin portal.

---

## Step-by-step setup

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

This runs `npm install` in the root, `backend/`, and `frontend/`.

### 2. Start MySQL via Docker Compose

```bash
docker compose up -d
```

This launches a MySQL 8 container exposing port 3306 with:

| Setting           | Value           |
|-------------------|-----------------|
| Database          | `lazybarbers`   |
| User              | `lazy`          |
| Password          | `lazypass`      |
| Root password     | `rootpass`      |

Wait ~10 seconds for the container to pass its healthcheck. Verify:

```bash
docker compose ps
# STATUS should show "healthy"
```

### 3. Set up environment variables

```bash
cp backend/.env.example backend/.env
```

The defaults match `docker-compose.yml`. **No editing required for local dev.**

If you want to point at a different MySQL instance, edit `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=lazy
DB_PASSWORD=lazypass
DB_NAME=lazybarbers
```

### 4. Run migrations and seed data

```bash
npm run db:setup
```

This applies the migration in `backend/src/db/migrations/0000_init.sql` (12 tables) and inserts:

- 1 admin account
- 5 barbers (with weekly schedules + accounts)
- 6 services
- 6 published reviews

The seed is **idempotent** — safe to re-run.

### 5. Start both servers

```bash
npm run dev
```

This launches both processes concurrently:

- Backend  →  http://localhost:4000
- Frontend →  http://localhost:5173

The frontend's Vite dev server proxies `/api/*` to the backend, so cookies and CORS just work in dev.

### 6. Open the app

Visit **http://localhost:5173**.

---

## Default accounts

| Role   | Email                       | Password    |
|--------|-----------------------------|-------------|
| Admin  | `admin@lazybarbers.com`     | `Admin123!` |
| Barber | `jase@lazybarbers.com`      | `Barber123!`|
| Barber | `pawan@lazybarbers.com`     | `Barber123!`|
| Barber | `sarun@lazybarbers.com`     | `Barber123!`|
| Barber | `rubin@lazybarbers.com`     | `Barber123!`|
| Barber | `chakit@lazybarbers.com`    | `Barber123!`|

Customers can register themselves via the **Sign Up** flow.

Email verification is **simulated** — the 6-digit code is:

- Logged to the backend console (look for the `✉️  [SIMULATED EMAIL]` banner)
- Stored in the `notifications` table (visible in the admin notifications log)
- **Returned in the API response** when `NODE_ENV=development`, so the
  Verify Email page auto-fills the code for instant testing

---

## Available scripts (run from project root)

| Command              | What it does                                  |
|----------------------|-----------------------------------------------|
| `npm run install:all`| Install root + backend + frontend deps        |
| `npm run dev`        | Start both servers via concurrently           |
| `npm run db:setup`   | Run migrations + seed                         |
| `npm run db:reset`   | **Drop all tables**, then migrate + seed      |
| `npm run db:generate`| Regenerate migrations from `schema.js`        |
| `npm run db:migrate` | Apply pending migrations only                 |
| `npm run db:seed`    | Seed only (idempotent)                        |
| `npm run build`      | Build the frontend for production             |

---

## Stopping & cleaning up

```bash
docker compose down       # stop MySQL (data volume preserved)
docker compose down -v    # stop AND delete the data volume (full wipe)
```

To wipe just the database (keeps the volume):
```bash
npm run db:reset
```

---

## Project structure

```
lazy-barbers/
├── backend/
│   ├── src/
│   │   ├── config/             # constants, db connection
│   │   │   ├── constants.js    # business rules (slot size, hours, etc.)
│   │   │   └── db.js           # mysql2 pool + Drizzle wrapper
│   │   ├── db/
│   │   │   ├── schema.js       # Drizzle schema (12 tables)
│   │   │   ├── migrations/     # generated SQL migrations
│   │   │   ├── migrate.js      # runs pending migrations
│   │   │   ├── reset.js        # drops all tables
│   │   │   └── seed.js         # idempotent seed
│   │   ├── middleware/
│   │   │   ├── auth.js         # requireAuth + requireRole
│   │   │   ├── validate.js     # Zod-based body/query/params validation
│   │   │   └── errorHandler.js # central error → JSON envelope
│   │   ├── repositories/       # Drizzle query layer (9 files)
│   │   ├── routes/             # Express routers (11 files, 55 routes)
│   │   ├── services/           # Business logic
│   │   │   ├── sms/            # provider-swappable SMS
│   │   │   │   ├── SmsProvider.js
│   │   │   │   ├── ConsoleSmsProvider.js
│   │   │   │   ├── TwilioSmsProvider.js  (stub)
│   │   │   │   └── index.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js   ★ double-booking prevention
│   │   │   ├── availabilityService.js
│   │   │   ├── adminService.js
│   │   │   ├── barberService.js
│   │   │   ├── chatbotService.js
│   │   │   └── emailService.js
│   │   ├── utils/              # time, hash, jwt, reference, response
│   │   ├── tests/              # smoke test
│   │   ├── app.js              # Express wiring
│   │   └── server.js           # HTTP listener (entry)
│   ├── drizzle.config.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/                # Axios client + per-resource modules
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer, PublicLayout, DashboardLayout
│   │   │   ├── common/         # Spinner, Stars, Modal
│   │   │   ├── booking/        # Stepper + 4 step components
│   │   │   └── chatbot/        # Floating chat widget
│   │   ├── pages/
│   │   │   ├── public/         # Home, Services, Gallery, Reviews, Team, About, Contact, NotFound
│   │   │   ├── auth/           # SignIn, SignUp, VerifyEmail, ForgotPassword
│   │   │   ├── booking/        # BookingFlow, Confirmation, Receipt
│   │   │   ├── customer/       # MyBookings, Profile
│   │   │   ├── barber/         # Dashboard, TimeOff
│   │   │   └── admin/          # Dashboard, Schedule, Services, Customers, Revenue, Barbers, Contact
│   │   ├── context/            # Auth, Toast, Booking
│   │   ├── routes/             # AppRoutes, ProtectedRoute
│   │   ├── lib/                # format helpers
│   │   ├── styles/             # globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── docker-compose.yml          # MySQL 8 container
├── package.json                # concurrently scripts (root)
├── .gitignore
└── README.md
```

---

## API overview

Base URL: `/api/v1`

All responses use a consistent envelope:

**Success:**
```json
{ "ok": true, "data": <payload>, "meta": { "page": 1, "page_size": 20, "total": 142 } }
```

**Error:**
```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

**Total: 55 routes** organized as:
- `/auth` — register, verify-email, login, logout, forgot-password, reset-password, me
- `/services` — public list + admin CRUD
- `/barbers` — public list/detail/schedule + admin CRUD + admin/self schedule edit
- `/availability` — slot grid for service+date+barber (or "any available")
- `/bookings` — create, list-mine, get, cancel, reschedule, status update, receipt
- `/customer/me` — profile read/update
- `/barber/me` — barber portal: profile, schedule, today's appointments, time-off
- `/admin/*` — dashboard stats, bookings, schedule, customers, revenue, time-off review, contact messages, notifications log
- `/contact` — public contact form submission
- `/reviews` — public list + customer review submission
- `/chatbot/message` — rule-based LazyBot

---

## How double booking is prevented

`POST /api/v1/bookings` runs inside a MySQL transaction that:

1. Acquires a row-level lock on the target barber:
   ```sql
   SELECT id FROM barbers WHERE id = ? FOR UPDATE
   ```
2. With the lock held, runs the authoritative overlap check:
   ```sql
   SELECT id FROM bookings
   WHERE barber_id = ?
     AND status IN ('pending','confirmed')
     AND start_at < :requested_end
     AND end_at   > :requested_start
   ```
3. Returns `409 SLOT_TAKEN` if any row is returned.
4. Otherwise inserts the booking and commits.

The `FOR UPDATE` lock serializes any concurrent attempt to book the same
barber, eliminating the race window between overlap-check and insert.

Booking references (`LB-2026-0001`, `LB-2026-0002`, …) use a per-year
atomic counter via:
```sql
INSERT INTO booking_counters (year, value) VALUES (?, 1)
ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)
```

Reschedules use the same locked overlap check, excluding the booking's own row.

---

## SMS service (simulated, provider-swappable)

SMS is structured as an abstract provider so a real API (e.g., Twilio)
can be swapped in later **without touching booking logic**.

In `backend/.env`:

```
SMS_PROVIDER=console     # default — prints to terminal + logs to DB
SMS_PROVIDER=twilio      # use the Twilio stub (requires credentials)
```

Files:

- `backend/src/services/sms/SmsProvider.js` — abstract interface
- `backend/src/services/sms/ConsoleSmsProvider.js` — dev provider
- `backend/src/services/sms/TwilioSmsProvider.js` — Twilio stub
- `backend/src/services/sms/index.js` — public API + templates

Every send is recorded in the `notifications` table regardless of provider.

Triggered after:
- Booking confirmation
- Booking cancellation
- Booking reschedule

The SMS body is also returned in the booking-creation response so the
confirmation screen can display it (matching the UI's "SMS sent to ..." box).

---

## Smoke test

The backend ships an in-process smoke test that boots Express on a random
port and verifies the response envelope is consistent across success,
validation, auth-required, and 404 paths:

```bash
cd backend && node src/tests/smoke.js
```

You should see:
```
✓ Health check
✓ 404 envelope
✓ Zod validation envelope
✓ Auth required envelope
✓ Chatbot (no DB) — greeting
✓ Chatbot validation
✓ Bookings requires auth
✓ Admin route requires auth
✓ Login validation envelope

  9 passed, 0 failed
```

---

## Troubleshooting

**"connect ECONNREFUSED 127.0.0.1:3306"**
→ MySQL hasn't finished starting. Wait 10s after `docker compose up -d` and run `docker compose ps` to confirm it shows `healthy`.

**"Access denied for user 'lazy'@..."**
→ Recreate the container (the password is set on first boot only):
```bash
docker compose down -v
docker compose up -d
npm run db:setup
```

**Frontend shows blank page or 404 on routes**
→ Make sure both servers are running (`npm run dev` from root). Frontend at `:5173`, backend at `:4000`.

**"Email not verified" on customer login**
→ Customers must verify via the 6-digit code. In dev, the code is
  auto-filled on the Verify Email page or visible in the backend
  console under `✉️ [SIMULATED EMAIL]`.

**Reset everything and start fresh:**
```bash
docker compose down -v
docker compose up -d
npm run db:setup
```
