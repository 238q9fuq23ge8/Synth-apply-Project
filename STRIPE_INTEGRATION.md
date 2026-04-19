# Frontend Stripe Integration

## Overview
The Plans page has been updated to integrate with the backend Stripe payment system for purchasing credits.

## Features Implemented

### 1. Credit Packages
- **Free Trial**: 7 days / 100 credits (no payment)
- **100 Credits**: AED 10 (one-time purchase)
- **500 Credits**: AED 50 (one-time purchase) - **Best Value**
- **1000 Credits**: AED 80 (one-time purchase)

### 2. Payment Flow
1. User clicks "Purchase Credits" button
2. Frontend calls `/v1/payments/create-checkout-session` with price_id
3. Backend creates Stripe checkout session
4. User is redirected to Stripe checkout
5. After payment, user is redirected back to `/plans?intent=payment_success`
6. Credits are automatically added via webhook

### 3. UI Features
- **Current Credits Display**: Shows user's current credit balance
- **Loading States**: Buttons show spinner during checkout creation
- **Toast Notifications**: Success/failure messages for payment intents
- **Current Plan Badge**: Shows "Current" for free trial users
- **Best Value Badge**: Highlights the 500 credits package

### 4. Error Handling
- Authentication required (redirect to login)
- Payment errors with user-friendly messages
- Network error handling
- Invalid price_id validation

## Environment Variables Required

Create a `.env` file in the frontend directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Testing

### Local Development
1. Start the backend server
2. Start the frontend: `npm run dev`
3. Navigate to `/plans`
4. Click "Purchase Credits" on any package
5. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Payment Success Flow
1. Complete payment with test card
2. User redirected to `/plans?intent=payment_success`
3. Toast notification shows success message
4. Credits automatically added to account
5. Current credits display updates

## API Integration

The frontend uses the existing `api.ts` client to make authenticated requests:

```typescript
// Create checkout session
const response = await api.post("/v1/payments/create-checkout-session", 
  { price_id: priceId },
  { headers: { Authorization: `Bearer ${token}` }}
);
```

## State Management

- **Loading States**: Per-button loading during checkout creation
- **User Data**: Credits and plan from localStorage
- **URL Params**: Payment intent handling via useSearchParams
- **Toast System**: Success/error notifications

## Security

- JWT authentication required for all payment requests
- Price validation on backend
- Webhook signature verification
- No sensitive data stored in frontend
