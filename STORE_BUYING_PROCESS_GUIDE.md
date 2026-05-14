# Store Buying Process Implementation Guide

## Overview
Complete implementation of store buying process where pet owners can purchase products using **Card Payment** or **Cash on Delivery (COD)**, and shop owners can approve or reject orders from their dashboard.

---

## System Architecture

### Payment Methods

#### 1. Card Payment
- Customer enters card details on checkout
- Order marked as **PAID** immediately
- Order status: `processing` (ready to ship)
- Shop owner can proceed to pack and ship

#### 2. Cash on Delivery (COD)
- No payment required upfront
- Order marked as **PENDING** payment
- Order status: `placed` (waiting for shop approval)
- Shop owner can **APPROVE** or **REJECT** the order
- On approval: Order moves to `processing`
- On rejection: Stock is restored, customer notified

---

## User Flows

### Pet Owner - Buying Process

#### Step 1: Browse & Add Products
```
1. Navigate to /market
2. Browse available products
3. Click "Add" button on product card
4. Products added to localStorage cart
```

#### Step 2: View Cart
```
1. Go to /cart
2. See all added products with quantities
3. Update quantities or remove items
4. Click "Checkout" button
```

#### Step 3: Checkout & Payment Selection
```
URL: /checkout

Fields Required:
├── Shipping Details
│   ├── Full Name *
│   ├── Email Address *
│   ├── Phone Number
│   └── Delivery Address *
└── Payment Method (select one)
    ├── Card Payment
    │   ├── Name on Card
    │   ├── Card Number
    │   ├── Expiry (MM/YY)
    │   └── CVC
    └── Cash on Delivery
        └── (No card details needed)

Action: Click "Place Order" or "Submit COD Order"
```

#### Step 4: Order Confirmation
```
Redirect to: /orders/{orderId}

Shows:
- Order ID
- Status (processing or placed)
- Payment method
- Items list
- Total amount
- Tracking number

For COD: "Your cash on delivery order is waiting for shop approval"
For Card: "Order confirmed and being prepared for shipment"
```

#### Step 5: Receive Notifications
```
Location: /notifications

Notifications Received:
├── Order Placed (automatic)
├── Order Approved (when shop approves COD)
└── Order Rejected (if shop rejects COD)
```

---

### Shop Owner - Order Management

#### Step 1: Access Dashboard
```
URL: /dashboard/petshop

Shows:
├── Stats Cards
│   ├── Total Products
│   ├── COD Approvals (pending count)
│   ├── Total Orders
│   └── Order Value (revenue)
├── Add Product Section
├── Cash on Delivery Requests (pending orders)
├── Recent Orders
├── Inventory List
└── Low Stock Alerts
```

#### Step 2: View Pending COD Orders
```
Section: "Cash on Delivery Requests"

For Each Order:
├── Customer Name
├── Products Ordered (with quantities)
├── Delivery Address
├── Total Amount
└── Actions
    ├── [Approve] Button
    └── [Reject] Button
```

#### Step 3: Approve Order
```
Action: Click "Approve" button

Process:
1. Order status changes from "placed" → "processing"
2. Shop owner gets confirmation message
3. Customer receives notification: "Order Approved"
4. Order moves from pending to recent orders

Result:
- Order is now in processing state
- Ready to be packed and shipped
```

#### Step 4: Reject Order (Optional)
```
Action: Click "Reject" button

Process:
1. Product stock is automatically restored
2. Order status changes to "rejected"
3. Payment status: "failed" (if payment was processed)
4. Shop owner gets confirmation message
5. Customer receives notification: "Order Rejected"

Result:
- Customer can reorder or contact shop
- Stock levels restored
```

---

## API Endpoints

### Customer Endpoints

#### 1. Place Order
```
POST /market/orders

Request Body:
{
  "items": [
    { "product": "product_id", "quantity": 2 }
  ],
  "shipping": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State, ZIP"
  },
  "paymentMethod": "cod" | "card",
  "paymentToken": "mock_card_token_xxxxx",    // required for card
  "paymentLast4": "4242",                      // required for card
  "notes": "optional notes"
}

Response:
{
  "item": {
    "_id": "order_id",
    "user": { "_id": "user_id", "name": "John", "email": "john@example.com" },
    "shippingName": "John Doe",
    "shippingAddress": "123 Main St, City, State, ZIP",
    "paymentMethod": "cod",
    "paymentStatus": "pending",
    "orderStatus": "placed",
    "items": [
      { "product": {...}, "quantity": 2, "price": 29.99 }
    ],
    "total": 59.98,
    "trackingNumber": "PC-XXXXX-YYYYY",
    "estimatedDeliveryAt": "2026-05-19T...",
    "trackingHistory": [...]
  }
}
```

#### 2. Get Order Details
```
GET /market/orders/:id

Response: Full order object with populated product and seller info
```

#### 3. Get Customer's Orders
```
GET /market/orders

Response:
{
  "items": [
    { order objects... }
  ]
}
```

#### 4. Get Notifications
```
GET /notifications

Response:
{
  "items": [
    {
      "_id": "notif_id",
      "user": "user_id",
      "title": "New Order Received",
      "message": "You have received a new order...",
      "type": "order",
      "relatedOrder": "order_id",
      "channel": "inApp",
      "readAt": null,
      "createdAt": "..."
    }
  ]
}
```

---

### Shop Owner Endpoints

#### 1. Get Shop Dashboard
```
GET /market/shop/dashboard

Response:
{
  "inventory": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 29.99,
      "stock": 15,
      "lowStockThreshold": 10,
      ...
    }
  ],
  "orders": [recent order objects...],
  "summary": {
    "totalProducts": 24,
    "lowStock": 2,
    "orders": 156,
    "pendingCod": 5,
    "revenue": 4532.50
  }
}
```

#### 2. Get Shop's Orders
```
GET /market/shop/orders

Response:
{
  "items": [
    { order objects filtered for this seller... }
  ]
}
```

#### 3. Approve COD Order
```
PATCH /market/shop/orders/{orderId}/approve

Response:
{
  "item": {
    "_id": "order_id",
    "orderStatus": "processing",  // changed from "placed"
    "trackingHistory": [
      ...,
      {
        "status": "processing",
        "message": "Cash on delivery order approved by the shop",
        "timestamp": "..."
      }
    ],
    ...
  }
}
```

#### 4. Reject COD Order
```
PATCH /market/shop/orders/{orderId}/reject

Request Body (optional):
{
  "reason": "Out of stock" | "Invalid address" | etc.
}

Response:
{
  "item": {
    "_id": "order_id",
    "orderStatus": "rejected",
    "paymentStatus": "failed",
    "trackingHistory": [
      ...,
      {
        "status": "rejected",
        "message": "Cash on delivery order rejected by the shop",
        "timestamp": "..."
      }
    ],
    ...
  }
}

Side Effect:
- Product stock restored
- Customer notified
```

---

## Database Changes

### Notification Model
```javascript
{
  user: ObjectId (required),
  title: String,
  message: String,
  type: enum["vaccination", "appointment", "promotion", "emergency", "order", "system"],
  relatedOrder: ObjectId (new field, links to Order),
  channel: enum["email", "push", "inApp"],
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model (No changes, already had required fields)
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  shippingName: String,
  shippingEmail: String,
  shippingPhone: String,
  shippingAddress: String,
  paymentMethod: enum["card", "cod"],
  paymentStatus: enum["pending", "paid", "failed", "refunded"],
  orderStatus: enum["placed", "processing", "shipped", "delivered", "rejected", "cancelled"],
  total: Number,
  trackingNumber: String,
  trackingHistory: [{
    status: String,
    message: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Components

### Pages Modified/Created

#### 1. `/checkout` (Checkout.jsx)
- **Features**: 
  - Shipping details form (name, email, phone, address)
  - Payment method selection (Card vs COD)
  - Card details input (conditional on card selection)
  - Order summary
  - Form validation

- **Actions**:
  - On submit: POST to `/market/orders`
  - Clear cart on success
  - Redirect to order detail page

#### 2. `/dashboard/petshop` (PetShopDashboard.jsx)
- **Features**:
  - Dashboard stats (products, pending COD, orders, revenue)
  - COD requests section with approve/reject buttons
  - Recent orders list
  - Product inventory
  - Low stock alerts

- **Actions**:
  - Approve: PATCH `/market/shop/orders/:id/approve`
  - Reject: PATCH `/market/shop/orders/:id/reject`
  - Auto-refresh dashboard after actions

#### 3. `/orders` and `/orders/:id` (Orders.jsx)
- **Features**:
  - Order list for customer
  - Order details with items, total, status
  - Tracking information
  - Status message for COD orders

#### 4. `/notifications` (Notifications.jsx)
- **Features**:
  - Display all notifications
  - Mark as read functionality
  - Type icons for different notification types
  - Shows order-related notifications

---

## Testing Checklist

### Pet Owner Testing

#### Card Payment Flow
- [ ] Login as pet owner
- [ ] Browse marketplace (/market)
- [ ] Add multiple products to cart
- [ ] Go to /cart and verify items
- [ ] Click Checkout
- [ ] Fill in shipping details (all fields)
- [ ] Select "Card payment" option
- [ ] Enter card details:
  - Card name: "Test User"
  - Card number: "4242 4242 4242 4242"
  - Expiry: "12/26"
  - CVC: "123"
- [ ] Click "Pay and place order"
- [ ] Verify order created with status "processing"
- [ ] Check order detail page shows card payment
- [ ] Verify cart is cleared

#### COD Payment Flow
- [ ] Login as pet owner
- [ ] Add products to cart
- [ ] Go to /checkout
- [ ] Fill in shipping details
- [ ] Select "Cash on delivery" option
- [ ] Click "Submit COD order"
- [ ] Verify order created with status "placed"
- [ ] See message: "Your cash on delivery order is waiting for shop approval"
- [ ] Check order detail page shows COD payment
- [ ] Check /notifications for "Order Received" notification

### Shop Owner Testing

#### Approve COD Order Flow
- [ ] Login as shop owner (petShop role)
- [ ] Go to /dashboard/petshop
- [ ] Verify "COD Approvals" stat shows pending count
- [ ] See pending order in "Cash on Delivery Requests" section
- [ ] Click "Approve" button
- [ ] Verify success message
- [ ] Order status changes to "processing"
- [ ] Order moved from pending to recent orders
- [ ] Customer receives "Order Approved" notification

#### Reject COD Order Flow
- [ ] Login as shop owner
- [ ] Go to /dashboard/petshop
- [ ] See pending order in "Cash on Delivery Requests"
- [ ] Click "Reject" button
- [ ] Verify success message
- [ ] Order status changes to "rejected"
- [ ] Check product stock increased (restored)
- [ ] Customer receives "Order Rejected" notification

---

## Demo Account Credentials

Use these test accounts (password: `demo123`):

### Pet Owner
- Email: `owner@demo.com`
- Role: petOwner

### Shop Owner
- Email: `shop@demo.com`
- Role: petShop
- Note: May need admin approval first

### Admin (for approvals)
- Email: `admin@demo.com`
- Role: admin

---

## Error Handling

### Common Errors & Solutions

1. **"Cart items required"**
   - Add at least one product to cart before checkout

2. **"Shipping name and address are required"**
   - Fill in all required shipping fields (marked with *)

3. **"Card payment details are required"**
   - When selecting card payment, enter all card details
   - Card number must be numeric

4. **"Insufficient stock for {product}"**
   - Product stock has changed since adding to cart
   - Remove and re-add product, or update quantity

5. **"Only pending cash on delivery orders can be approved"**
   - Can only approve orders with:
     - paymentMethod: "cod"
     - paymentStatus: "pending"
     - orderStatus: "placed"

---

## Future Enhancements

- [ ] Email notifications integration
- [ ] SMS notifications
- [ ] Real-time updates via WebSocket
- [ ] Refund processing
- [ ] Multiple seller order handling
- [ ] Order cancellation by customer
- [ ] Review and rating system
- [ ] Order tracking with location
- [ ] Scheduled delivery
- [ ] Multiple addresses for customer

