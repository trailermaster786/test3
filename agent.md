# AquaTrack - Agent Instructions

## Project Overview
AquaTrack is a Smart Water Factory & Logistics web application built with Next.js 16, TypeScript, Prisma (SQLite), Zustand, Socket.IO, and shadcn/ui.

## Architecture
- **Single-page app** with client-side portal routing via Zustand store
- **3 Portals**: Customer, Driver, Admin — each is a component that renders different pages based on Zustand state
- **Only route**: `/` (src/app/page.tsx) — the main entry point
- **API Routes**: Under `src/app/api/` — RESTful endpoints for all CRUD operations
- **WebSocket**: Mini-service on port 3003 for real-time notifications (use `/?XTransformPort=3003` from client)
- **Database**: SQLite via Prisma ORM — file at `/home/z/my-project/db/aquatrack.db`
- **Auth**: JWT stored in httpOnly cookies, verified server-side

## File Structure
```
src/
  app/
    page.tsx          — Main entry, renders Login or Portal based on auth
    layout.tsx        — Root layout with metadata
    api/              — All API routes
  components/
    shared/           — Login form, portal gate
    portal/
      customer/       — customer-portal.tsx (7 pages)
      driver/         — driver-portal.tsx (6 pages)
      admin/          — admin-portal.tsx (9+ pages)
    ui/               — shadcn/ui components (already installed)
  lib/
    db.ts             — Prisma client singleton
    auth.ts           — JWT helpers (jose + bcryptjs)
    constants.ts      — Enums, labels, colors
    bottle-logic.ts   — Bottle state machine, promo calc
  stores/
    app-store.ts      — Zustand store (auth, cart, navigation, notifications)
prisma/
  schema.prisma      — 12 models
  seed.ts            — Demo data (6 users, 4 products, 70 bottles, 3 orders, 2 trucks)
mini-services/
  websocket/         — Socket.IO server on port 3003
```

## Demo Credentials
- **Admin**: admin@aquatrack.com / admin123
- **Driver**: driver@aquatrack.com / driver123
- **Customer**: customer@aquatrack.com / customer123

## Database Models
User, Address, PaymentMethod, Product, Bottle, BottleEvent, Order, OrderItem, PromoOffer, Truck, SalesTarget, Notification

## Key Business Logic
- **Bottle State Machine**: IN_FACTORY → LOADED_ON_TRUCK → DELIVERED → COLLECTED → BACK_AT_FACTORY → (auto-flag at max refills) → FLAGGED_FOR_DESTRUCTION
- **Order Lifecycle**: PENDING → CONFIRMED → ASSIGNED → IN_TRANSIT → DELIVERED
- **Promo System**: Percentage or fixed discounts with min order threshold
- **Real-time Notifications**: When customer places order → admin gets popup notification via WebSocket

## Critical Cross-Portal Data Flow
1. Customer creates order → saved to DB with status PENDING + Notification record created
2. Admin views orders via `GET /api/admin/orders` — fetches ALL orders from DB
3. Admin assigns driver via `POST /api/admin/assign-order` → order status becomes ASSIGNED, driverId set
4. Driver views manifest via `GET /api/drivers/manifest` — fetches orders where driverId = their ID
5. Driver updates status → customer & admin get real-time WebSocket update

## Environment
- DATABASE_URL must be set in shell: `DATABASE_URL='file:/home/z/my-project/db/aquatrack.db'`
- JWT_SECRET, WS_PORT=3003 in .env
- Dev server runs on port 3000
- WebSocket on port 3003
- Use relative paths with `?XTransformPort=3003` for WebSocket from client

## UI Rules
- Use shadcn/ui components from `src/components/ui/`
- Tailwind CSS 4 for styling
- Lucide icons
- Responsive mobile-first design
- No indigo/blue colors unless specified
- Show loading states, error messages, empty states
- Use sonner for toast notifications (already installed)
