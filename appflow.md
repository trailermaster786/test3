# AquaTrack - Application Flow

## Login Flow
```
User opens app → Login screen with email/password
  ↓
POST /api/auth/login → JWT set in httpOnly cookie
  ↓
GET /api/auth/me → fetch user profile
  ↓
Redirect to correct portal based on user.role
```

## Customer Portal Flow
```
Shop Page
  → Browse products (GET /api/products)
  → Add to cart (Zustand store)
  ↓
Cart Page
  → View items, adjust quantities, apply promo code
  → Click "Checkout"
  ↓
Checkout Page
  → Select address, payment method
  → POST /api/orders/create → saves order to DB
  → Creates Notification record for admin
  → Emits 'send-notification' via WebSocket to admin
  → Simulated payment → POST /api/orders/checkout
  ↓
Orders Page
  → GET /api/orders/list → shows customer's own orders
  → Click order → Order Detail page
  ↓
Profile Page
  → View/edit name, phone, addresses
  → Logout
```

## Admin Portal Flow
```
Overview Dashboard
  → GET /api/admin/reports → stats, charts, recent orders
  → Real-time notification popup when new order arrives (WebSocket)
  ↓
Orders Management
  → GET /api/admin/orders → ALL orders with user, driver, items
  → Filter by status, search by name/email
  → Click order → View details
  → Assign driver: POST /api/admin/assign-order
  → Update status
  ↓
Bottle Management
  → GET /api/admin/bottles → all bottles with filters
  → Generate bottles: POST /api/bottles/generate
  ↓
Destruction Queue
  → GET /api/admin/destruction → flagged bottles
  → POST /api/admin/destruction → destroy selected bottles
  ↓
Promo Management
  → GET /api/admin/promos → all promos
  → Create/edit promo codes
  ↓
User Management
  → GET /api/admin/users → all users
  → Create/edit/deactivate users
  ↓
Fleet Management
  → GET /api/admin/fleet → all trucks
  → Assign drivers to trucks
  ↓
Sales Targets
  → GET /api/admin/sales-targets → driver targets
  → Create targets, view progress
  ↓
Reports
  → Revenue, order status breakdown, trends
```

## Driver Portal Flow
```
Manifest Page
  → GET /api/drivers/manifest → orders assigned to this driver
  → Shows delivery list with customer info & addresses
  ↓
Scan Stock-In
  → Scan bottle QR → POST /api/bottles/events (LOADED)
  → Bottle status: IN_FACTORY → LOADED_ON_TRUCK
  ↓
Scan Stock-Out (Delivery)
  → Scan bottle QR → POST /api/bottles/events (DELIVERED)
  → Bottle status: LOADED_ON_TRUCK → DELIVERED
  ↓
Scan Returns
  → Scan bottle QR → POST /api/bottles/events (COLLECTED)
  → Bottle status: DELIVERED → COLLECTED → BACK_AT_FACTORY
  ↓
Customer Lookup
  → Search customers by name/email/phone
  ↓
On-Behalf Order
  → Place order for a customer
```

## Real-Time Notification Flow
```
Customer places order
  ↓
1. POST /api/orders/create saves to DB
2. Creates Notification record (role='admin')
3. Client emits 'send-notification' to WebSocket
4. WebSocket broadcasts to all registered 'admin' clients
5. Admin portal receives 'notification' event
6. Admin sees popup/toast: "New Order #123 by Mohammed Customer"
7. Admin clicks notification → navigates to Orders page
```

## Order Status Transitions
```
PENDING → CONFIRMED (admin confirms)
CONFIRMED → ASSIGNED (admin assigns driver)
ASSIGNED → IN_TRANSIT (driver starts delivery)
IN_TRANSIT → DELIVERED (driver confirms delivery)
PENDING → CANCELLED (customer cancels)
```

## Bottle State Machine
```
IN_FACTORY → LOADED_ON_TRUCK → DELIVERED → COLLECTED → BACK_AT_FACTORY
                                                                    ↓
                                                          (if refills >= max)
                                                                    ↓
                                                          FLAGGED_FOR_DESTRUCTION
```
