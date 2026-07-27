# AquaTrack - Implementation Guide

## Current Status
- [x] Prisma schema (12 models) — prisma/schema.prisma
- [x] Database seeded with demo data — prisma/seed.ts
- [x] Auth system (JWT + bcryptjs) — src/lib/auth.ts
- [x] Business logic (bottle state machine, promo calc) — src/lib/bottle-logic.ts
- [x] Constants & enums — src/lib/constants.ts
- [x] Zustand store (auth, cart, nav, notifications) — src/stores/app-store.ts
- [x] Auth API routes (signup, login, me)
- [x] Order API routes (create, list, status, checkout)
- [x] Admin API routes (orders, users, fleet, promos, bottles, destruction, reports, sales-targets, assign-order)
- [x] Driver API routes (manifest)
- [x] Product, Bottle, Notification, Promo API routes
- [x] WebSocket mini-service on port 3003

## Remaining Implementation

### 1. Shared Components
- [ ] `src/components/shared/login-form.tsx` — Login/signup form with quick demo buttons

### 2. Customer Portal (`src/components/portal/customer/customer-portal.tsx`)
Must implement 7 pages as a single component with internal routing:
- [ ] **Shop** — Product grid with Add to Cart buttons (fetch from GET /api/products)
- [ ] **Scan** — QR code scanner placeholder (camera not available in sandbox, show manual QR input)
- [ ] **Cart** — Cart items list, quantity controls, promo code input, total, Checkout button
- [ ] **Checkout** — Address selection, payment method, place order (POST /api/orders/create), then POST /api/orders/checkout, emit WebSocket notification
- [ ] **Orders** — Order list (GET /api/orders/list), click to view detail
- [ ] **Order Detail** — Full order info with status badge, items, address, timeline
- [ ] **Profile** — User info, logout button

### 3. Admin Portal (`src/components/portal/admin/admin-portal.tsx`)
Must implement 10 pages as a single component with internal routing:
- [ ] **Overview** — Dashboard with stat cards (total orders, revenue, customers, drivers), Recharts bar/line charts for revenue by day, order status pie chart, recent orders table. **Must connect WebSocket and show popup notification when new order arrives.**
- [ ] **Orders** — Full order table with status filters, search, assign driver dropdown, status update buttons. Uses GET /api/admin/orders
- [ ] **Bottles** — Bottle table with status filter, QR search. Uses GET /api/admin/bottles
- [ ] **Generate Bottles** — Form with count input, POST /api/bottles/generate
- [ ] **Destruction** — Queue of flagged bottles, select & destroy. Uses GET/POST /api/admin/destruction
- [ ] **Promos** — Promo list, create form. Uses GET/POST /api/admin/promos
- [ ] **Users** — User table with role filter, create/edit/deactivate. Uses GET/POST/PATCH/DELETE /api/admin/users
- [ ] **Fleet** — Truck list, assign driver. Uses GET/POST/PATCH /api/admin/fleet
- [ ] **Sales Targets** — Target list with progress bars. Uses GET/POST /api/admin/sales-targets
- [ ] **Reports** — Charts and data tables

### 4. Driver Portal (`src/components/portal/driver/driver-portal.tsx`)
Must implement 6 pages as a single component with internal routing:
- [ ] **Manifest** — Delivery list from GET /api/drivers/manifest, show customer name, address, items, status
- [ ] **Scan Stock-In** — QR input field, POST /api/bottles/events (type: LOADED)
- [ ] **Scan Stock-Out** — QR input field, POST /api/bottles/events (type: DELIVERED)
- [ ] **Scan Returns** — QR input field, POST /api/bottles/events (type: COLLECTED)
- [ ] **Customer Lookup** — Search input, call admin users API filtered by customer role
- [ ] **On-Behalf Order** — Form to place order for a customer

### 5. Main Page (`src/app/page.tsx`)
- [ ] Check auth on mount (GET /api/auth/me)
- [ ] If not authed: show Login form
- [ ] If authed: show correct portal based on user.role
- [ ] Connect WebSocket on mount if admin

### 6. Layout (`src/app/layout.tsx`)
- [ ] Update metadata: title "AquaTrack", description
- [ ] Include Toaster from sonner

## API Endpoint Reference
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | None | Register user |
| POST | /api/auth/login | None | Login, set JWT cookie |
| GET | /api/auth/me | Any | Get current user |
| GET | /api/products | None/Public | List products |
| POST | /api/orders/create | Customer | Create order + notification |
| GET | /api/orders/list | Any (filtered) | List orders by role |
| PATCH | /api/orders/[id]/status | Any (scoped) | Update order status |
| POST | /api/orders/checkout | Customer | Simulate payment |
| GET | /api/admin/orders | Admin | ALL orders with includes |
| POST | /api/admin/assign-order | Admin | Assign driver to order |
| GET | /api/admin/bottles | Admin | All bottles with filters |
| POST | /api/bottles/generate | Admin | Generate N bottles |
| GET | /api/bottles/lookup?qr=xxx | Any | Lookup bottle by QR |
| POST | /api/bottles/events | Any | Record bottle event |
| GET | /api/admin/destruction | Admin | Flagged bottles |
| POST | /api/admin/destruction | Admin | Destroy bottles |
| GET | /api/admin/users | Admin | All users |
| POST | /api/admin/users | Admin | Create user |
| PATCH | /api/admin/users | Admin | Update user |
| DELETE | /api/admin/users | Admin | Deactivate user |
| GET | /api/admin/fleet | Admin | All trucks |
| POST | /api/admin/fleet | Admin | Create truck |
| PATCH | /api/admin/fleet | Admin | Update truck |
| GET | /api/admin/promos | Admin | All promos |
| POST | /api/admin/promos | Admin | Create promo |
| PATCH | /api/admin/promos/[id] | Admin | Update promo |
| GET | /api/admin/reports | Admin | Dashboard stats |
| GET | /api/admin/sales-targets | Admin | Sales targets |
| POST | /api/admin/sales-targets | Admin | Create target |
| GET | /api/drivers/manifest | Driver | Driver's assigned orders |
| GET | /api/notifications | Any | Get notifications by role |
| PATCH | /api/notifications | Any | Mark notification read |
| GET | /api/promos/active | Public | Active promo offers |

## Component Patterns

### API Fetch Helper
```typescript
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
```

### WebSocket Connection (Admin)
```typescript
import { io } from 'socket.io-client';
const socket = io('/?XTransformPort=3003');
socket.on('connect', () => {
  socket.emit('register', { role: 'admin', userId: user.id });
});
socket.on('notification', (data) => {
  // Show toast/popup
  toast.info(data.title, { description: data.message });
});
```

### Notification on Order Create (Customer Checkout)
```typescript
// After successful order creation
const socket = io('/?XTransformPort=3003');
socket.emit('send-notification', {
  role: 'admin',
  notification: {
    type: 'new_order',
    title: 'New Order Placed',
    message: `Order #${order.id.slice(0,8)} by ${user.name}`,
    orderId: order.id,
  }
});
```

## UI Component Usage
All shadcn/ui components are in `src/components/ui/`. Import like:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Droplets, Truck, Package, ShoppingCart, Users, Bell, BarChart3, Settings, LogOut, Plus, Search, RefreshCw, QrCode, UserCheck, Target, FileText, Home, ChevronLeft } from 'lucide-react';
```

## Color Scheme
- Primary: teal/cyan (water theme) — use `bg-teal-600`, `text-teal-600` etc.
- Accent: amber/orange for alerts, green for success
- Background: white/light gray
- Avoid indigo/blue