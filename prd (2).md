# AquaTrack — Smart Water Factory & Logistics Platform

## Product Requirements Document (PRD)

---

## 1. Product Vision

AquaTrack is a complete digital platform for a smart water bottle factory and delivery logistics company. It handles the full lifecycle: water bottle production, inventory tracking via QR codes, customer ordering, driver delivery management, and factory return/collection workflows. The system serves three distinct user roles through a unified web application.

## 2. User Roles & Portals

### 2.1 Customer Portal
| Feature | Description |
|---------|-------------|
| **Product Shop** | Browse available water products (18L, 5L bottles in standard/premium). Add to cart. |
| **QR Scanner** | Scan bottle QR codes to view bottle history, refill count, and current status. |
| **Shopping Cart** | View cart items, adjust quantities, remove items, apply promo codes, see totals. |
| **Checkout** | Select delivery address, choose payment method (cash/card), place order, simulated payment. |
| **Order History** | View all past and current orders with status tracking (Pending → Confirmed → Assigned → In Transit → Delivered). |
| **Order Detail** | Full order view with items, amounts, delivery address, driver info, status timeline. |
| **Profile** | View/edit name, phone number. View saved addresses. Logout. |

### 2.2 Driver Portal
| Feature | Description |
|---------|-------------|
| **Delivery Manifest** | List of all orders assigned to this driver with customer name, address, items, and delivery status. |
| **Scan Stock-In** | Scan bottle QR codes when loading bottles onto truck (IN_FACTORY → LOADED_ON_TRUCK). |
| **Scan Stock-Out (Delivery)** | Scan bottle QR codes when delivering to customer (LOADED_ON_TRUCK → DELIVERED). |
| **Scan Returns** | Scan bottle QR codes when collecting empty bottles from customer (DELIVERED → COLLECTED → BACK_AT_FACTORY). |
| **Customer Lookup** | Search for customers by name, email, or phone number. |
| **On-Behalf Order** | Place an order on behalf of a customer (e.g., phone order). |

### 2.3 Admin Portal
| Feature | Description |
|---------|-------------|
| **Overview Dashboard** | Stats cards (total orders, revenue, customers, drivers). Revenue chart (last 7 days bar/line chart). Order status pie chart. Recent orders table. **Real-time popup notification when new order is placed.** |
| **Orders Management** | Full table of ALL orders. Filter by status. Search by customer name/email. View details. Assign driver to order. Update order status. |
| **Bottle Tracking** | Table of all bottles with QR code, status, refill count. Filter by status. Search by QR code. |
| **Generate Bottles** | Form to generate N new bottles with unique QR codes. Auto-creates generation events. |
| **Destruction Queue** | List of bottles flagged for destruction (reached max refills). Select and destroy. |
| **Promo Engine** | Create/manage promotional codes (percentage or fixed discount, min order, max uses, date range). |
| **User Management** | View all users. Filter by role. Create new users. Edit user details. Deactivate users. |
| **Fleet Management** | View all trucks (plate, model, capacity, assigned driver). Create/edit trucks. Assign drivers. |
| **Sales Targets** | Set monthly sales targets per driver. View progress (achieved vs target). |
| **Reports** | Revenue trends, order volume, delivery performance metrics. |

## 3. Data Models

### User
- `id`, `name`, `email`, `password` (hashed), `phone`, `role` (customer/driver/admin), `avatar`, `isActive`, `createdAt`, `updatedAt`
- Relations: addresses, paymentMethods, orders, drivenOrders, assignedTruck

### Product
- `id`, `name`, `description`, `price`, `liter`, `image`, `isActive`, `stock`, `createdAt`, `updatedAt`

### Bottle
- `id`, `qrCode` (unique), `status`, `refillCount`, `maxRefills` (default 30), `createdAt`, `updatedAt`

### BottleEvent
- `id`, `bottleId`, `type` (GENERATED/LOADED/DELIVERED/COLLECTED/RETURNED/DESTROYED/SCANNED), `orderId`, `userId`, `notes`, `createdAt`

### Order
- `id`, `status`, `userId`, `driverId`, `addressId`, `totalAmount`, `discount`, `finalAmount`, `paymentMethod`, `paymentStatus`, `notes`, `createdAt`, `updatedAt`

### OrderItem
- `id`, `orderId`, `productId`, `quantity`, `unitPrice`

### Address
- `id`, `userId`, `label`, `street`, `city`, `isDefault`, `createdAt`

### PaymentMethod
- `id`, `userId`, `type`, `last4`, `isDefault`, `createdAt`

### PromoOffer
- `id`, `code` (unique), `description`, `type` (percentage/fixed), `value`, `minOrder`, `maxUses`, `usedCount`, `isActive`, `startsAt`, `endsAt`, `createdAt`

### Truck
- `id`, `plate` (unique), `model`, `capacity`, `isActive`, `driverId`

### SalesTarget
- `id`, `userId`, `targetType`, `period`, `targetAmount`, `achievedAmount`, `month`, `year`, `createdAt`, `updatedAt`

### Notification
- `id`, `userId`, `role`, `type`, `title`, `message`, `isRead`, `createdAt`

## 4. Business Logic

### 4.1 Bottle State Machine
```
IN_FACTORY → LOADED_ON_TRUCK → DELIVERED → COLLECTED → BACK_AT_FACTORY
                                                                    ↓
                                                      (if refillCount >= maxRefills)
                                                                    ↓
                                                      FLAGGED_FOR_DESTRUCTION
```
- Each transition is validated server-side
- When a bottle returns to factory (BACK_AT_FACTORY), refillCount increments
- If refillCount >= maxRefills (30), bottle auto-flags for destruction

### 4.2 Order Status Lifecycle
```
PENDING → CONFIRMED → ASSIGNED → IN_TRANSIT → DELIVERED
PENDING → CANCELLED (customer action)
```
- **PENDING**: Just placed by customer
- **CONFIRMED**: Admin confirmed the order
- **ASSIGNED**: Admin assigned a driver
- **IN_TRANSIT**: Driver started delivery
- **DELIVERED**: Delivery completed
- **CANCELLED**: Customer cancelled (only from PENDING)

### 4.3 Promo Discount System
- **Percentage**: `discount = subtotal × (value / 100)`
- **Fixed**: `discount = min(value, subtotal)`
- Only applies if `subtotal >= minOrder`
- Tracks `usedCount` against `maxUses`
- Must be `isActive` and within date range

### 4.4 Real-Time Notifications (WebSocket)
1. Customer places order
2. Order saved to DB + Notification record created
3. Client emits `send-notification` to WebSocket server
4. Server broadcasts to all registered `admin` clients
5. Admin portal shows popup/toast notification
6. Admin can click to navigate to the order

## 5. Technical Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | SQLite via Prisma ORM |
| State Management | Zustand |
| UI Components | shadcn/ui + Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Recharts |
| Auth | JWT (jose) + bcryptjs, httpOnly cookies |
| Real-time | Socket.IO (port 3003) |
| Toasts | Sonner |
| Animations | Framer Motion |

## 6. Key API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login, set JWT cookie
- `GET /api/auth/me` — Get current user

### Orders
- `POST /api/orders/create` — Create order (customer) + notification
- `GET /api/orders/list` — List orders (role-filtered)
- `PATCH /api/orders/[id]/status` — Update status
- `POST /api/orders/checkout` — Simulated payment

### Admin
- `GET /api/admin/orders` — All orders with full includes
- `POST /api/admin/assign-order` — Assign driver
- `GET /api/admin/bottles` — All bottles
- `POST /api/bottles/generate` — Generate bottles
- `GET/POST /api/admin/destruction` — Destroy flagged bottles
- `GET/POST /api/admin/users` — User CRUD
- `GET/POST/PATCH /api/admin/fleet` — Fleet management
- `GET/POST /api/admin/promos` — Promo management
- `GET /api/admin/reports` — Dashboard stats & charts data
- `GET/POST /api/admin/sales-targets` — Sales targets

### Driver
- `GET /api/drivers/manifest` — Driver's assigned orders

### Other
- `GET /api/products` — Product listing
- `GET /api/bottles/lookup?qr=xxx` — Bottle lookup
- `POST /api/bottles/events` — Record bottle event
- `GET /api/notifications` — Get notifications
- `PATCH /api/notifications` — Mark read
- `GET /api/promos/active` — Active promos

## 7. Demo Data

### Users
| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@aquatrack.com | admin123 | Admin User |
| Driver | driver@aquatrack.com | driver123 | Ahmed Driver |
| Driver | driver2@aquatrack.com | driver123 | Saeed Driver |
| Customer | customer@aquatrack.com | customer123 | Mohammed Customer |
| Customer | fatima@example.com | customer123 | Fatima Customer |
| Customer | khalid@example.com | customer123 | Khalid Customer |

### Products
| Name | Price | Size |
|------|-------|------|
| Standard Water 18L | AED 5 | 18L |
| Premium Mineral 18L | AED 8 | 18L |
| Standard Water 5L | AED 2.5 | 5L |
| Premium Mineral 5L | AED 4 | 5L |

### Sample Orders
- Order 1: DELIVERED, 3x Standard 18L, AED 15, cash, driver Ahmed
- Order 2: IN_TRANSIT, 2x Premium 18L, AED 16 (discount AED 1.5), card, driver Saeed
- Order 3: PENDING, 2x Standard 18L, AED 10, cash, no driver assigned yet

## 8. UI/UX Requirements

### Design Theme
- **Color**: Teal/cyan primary (water theme), white background, gray accents
- **Typography**: Clean, modern sans-serif
- **Layout**: Mobile-first responsive design
- **Icons**: Lucide icons throughout

### Key UX Patterns
- **Quick Demo Login**: 3 buttons on login screen (Admin, Driver, Customer) for easy testing
- **Loading states**: Skeleton/spinner during API calls
- **Error handling**: Toast notifications for errors, inline validation on forms
- **Empty states**: Helpful messages when no data (e.g., "No orders yet")
- **Real-time**: Admin gets instant popup notification on new orders
- **Navigation**: Sidebar on desktop, bottom nav on mobile for portals

## 9. Non-Functional Requirements

- **Single route**: All portals render on `/` with client-side Zustand routing
- **Database**: SQLite file at `/home/z/my-project/db/aquatrack.db`
- **WebSocket**: Mini-service on port 3003, connect via `/?XTransformPort=3003`
- **Authentication**: JWT in httpOnly cookies, 7-day expiry
- **Performance**: Efficient Prisma queries with selective includes
- **Security**: Role-based API access, password hashing, input validation