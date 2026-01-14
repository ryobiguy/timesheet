# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for the Timesheet Control application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_`)
4. Copy your **Publishable key** (starts with `pk_`) - you may need this for frontend later

## Step 2: Create a Product and Price

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Create a product:
   - **Name**: "Timesheet Control - Standard Plan"
   - **Description**: "£1 per employee per month"
   - **Pricing model**: Recurring
   - **Price**: £1.00
   - **Billing period**: Monthly
   - **Currency**: GBP
3. After creating, copy the **Price ID** (starts with `price_`)

## Step 3: Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/billing/webhook`
   - For local development, use Stripe CLI (see below)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 4: Configure Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret
STRIPE_PRICE_ID=price_... # Your price ID from Step 2
```

## Step 5: Local Development with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:5001/api/billing/webhook`
4. Copy the webhook signing secret from the CLI output and use it in your `.env`

## Testing

### Test Mode

Stripe provides test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date, any CVC, and any postal code

### Test Flow

1. Start your backend server
2. Navigate to `/dashboard/billing` in your app
3. Click "Subscribe Now"
4. Enter employee count (minimum 5)
5. Use test card `4242 4242 4242 4242` to complete checkout
6. Verify subscription status updates in the dashboard

## Production Deployment

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live** API keys (different from test keys)
3. Update environment variables with live keys
4. Set up production webhook endpoint
5. Test with real payment methods

## Important Notes

- **Minimum 5 employees**: The subscription requires at least 5 employees
- **Pricing**: £1 per employee per month
- **Billing**: Monthly recurring subscription
- **Currency**: GBP (British Pounds)

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint is accessible
2. Verify webhook secret matches
3. Check Stripe Dashboard → Webhooks → Events for delivery status
4. Use Stripe CLI for local testing

### Subscription Not Updating

1. Check webhook events are being received
2. Verify database connection
3. Check server logs for errors
4. Ensure organization ID matches in webhook metadata

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com)
