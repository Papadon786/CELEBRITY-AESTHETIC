# Zafoor Clinic & Celebrity Aesthetic Suite

A unified healthcare and aesthetic clinic platform containing two independent, fully featured applications:
1. **`CRM`**: Clinic Management System (Next.js 15, Prisma, local PostgreSQL, Sales & POS Module, auth bypass).
2. **`web`**: Patient-Facing Website & Booking Portal (Next.js 16, Tailwind CSS v4, Framer Motion, GSAP, Lenis smooth scrolling, hero canvas sequence, treatments explorer, online booking).

---

## Workspace Structure

```
zafoor-clinic/
├── CRM/                    # Clinic Management System (Port 3000)
│   ├── src/                # Next.js 15 app, components, actions, lib
│   │   ├── app/(main)/sales/ # NEW Sales & POS Terminal, Orders & Analytics
│   │   ├── actions/sales.ts  # Sales transactions, receipts, refund logic
│   │   └── components/sales/ # POS terminal, receipt modal, ledger, analytics
│   ├── prisma/             # Prisma schema, migrations, generated client
│   ├── .env                # Local PostgreSQL connection string
│   └── package.json
│
├── web/                    # Patient-Facing Website (Port 3001)
│   ├── app/                # Next.js 16 App Router (51+ pages & SSG routes)
│   ├── components/         # Hero sequence, treatments, booking form, navbar
│   ├── public/             # Hero sequence WebP frames, treatment images, team
│   ├── raw-assets/         # Raw source assets & clinic space imagery
│   ├── .env                # Public CRM API URL (http://localhost:3000/api/public)
│   └── package.json
│
├── docker-compose.yml      # Local PostgreSQL container (Port 5432)
└── package.json            # Root workspace orchestrator
```

---

## Quick Start

### 1. Start the Local PostgreSQL Database
```powershell
npm run db:up
```
*(Starts the PostgreSQL 16 container `ddd-db-1` on port 5432 with database `zafoor_clinic`)*

### 2. Run Both CRM and Web Concurrently
```powershell
npm run dev
```
- **CRM System**: Available at [http://localhost:3000](http://localhost:3000)
- **Web App**: Available at [http://localhost:3001](http://localhost:3001)

### 3. Or Run Either Application Individually
```powershell
# Run only CRM (Port 3000)
npm run dev:crm

# Run only Web (Port 3001)
npm run dev:web
```

### 4. Production Build
```powershell
# Build both applications
npm run build

# Or build individually
npm run build:crm
npm run build:web
```

---

## Key Features & Capabilities

### 1. `CRM` (Clinic Management System)
- **Sales & POS Module (`/sales`)**:
  - **POS Counter**: Real-time product & service search, category filters, stock level indicators.
  - **Dynamic Cart**: Item quantity adjustment, line-item discounts, custom tax percentage, gross/net pricing.
  - **Customer Selection**: Autocomplete lookup for registered patients or rapid walk-in registration.
  - **Multi-Payment Modes**: Cash, UPI, Card, Net Banking with split payment support.
  - **Branded Receipts**: Printable thermal POS (80mm) and A4 standard invoice format with clinic branding.
  - **Orders Ledger**: Searchable, date-filtered transaction history with instant receipt re-printing.
  - **Returns & Refunds**: Formal refund modal with automatic inventory restocking and audit log.
  - **Sales Analytics**: Revenue metrics, AOV, payment method split, and top-selling leaderboard.
- **Supabase Decoupled**: Replaced all Supabase clients with a high-performance local PostgreSQL Prisma singleton.
- **Login Bypass**: Seamless single-click access as the default Clinic Administrator.
- **Full Clinical Stack**: Appointments, patient electronic health records (EMR), billing & invoices, pharmacy/inventory, staff management.

### 2. `web` (Celebrity Aesthetic Website)
- **Interactive Hero Sequence**: 30-frame high-resolution WebP scrubbed canvas animation with GSAP ScrollTrigger.
- **Treatments Showcase**: Full catalog covering Skin, Hair, PMU (Permanent Makeup), and Laser Aesthetics with slug-based detail pages.
- **Direct Online Booking**:
  - Automatically pushes appointments to the CRM public API (`/api/public/appointments`).
  - Pre-fills and opens WhatsApp consultation chat for immediate patient engagement.
- **Visual Design**: Sleek dark luxury aesthetic, Lenis smooth scrolling, and mobile-optimized responsiveness.
