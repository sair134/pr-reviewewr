# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for your PR Reviewer application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Your application running locally

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the keys that start with `pk_test_` and `sk_test_`

## Step 2: Create Stripe Products and Prices

1. In your Stripe Dashboard, go to **Products**
2. Create three products:

### Product 1: Monthly Pro
- **Name**: Monthly Pro
- **Price**: $10.00 USD
- **Billing**: Recurring (monthly)
- **Price ID**: Note this down (e.g., `price_1ABC123...`)

### Product 2: Team Pro
- **Name**: Team Pro
- **Price**: $15.00 USD
- **Billing**: Recurring (monthly)
- **Price ID**: Note this down (e.g., `price_1DEF456...`)

## Step 3: Set Up Environment Variables

1. Copy `apps/next/env.example` to `apps/next/.env.local`
2. Update the Stripe variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 4: Update Price IDs in Code

1. Open `apps/next/src/app/payments/page.tsx`
2. Update the `stripePriceId` values in the plans array:

```typescript
const plans = [
  {
    id: 'free',
    // ... other properties
    stripePriceId: null
  },
  {
    id: 'monthly',
    // ... other properties
    stripePriceId: 'price_1ABC123...' // Your actual Monthly Pro price ID
  },
  {
    id: 'team',
    // ... other properties
    stripePriceId: 'price_1DEF456...' // Your actual Team Pro price ID
  }
];
```

## Step 5: Set Up Webhooks (Optional but Recommended)

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 6: Test the Integration

1. Start your application:
   ```bash
   npx nx dev next
   ```

2. Navigate to `/payments`
3. Click on a paid plan (Monthly Pro or Team Pro)
4. You'll be redirected to Stripe Checkout
5. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

## Step 7: Handle Successful Payments

After a successful payment, users will be redirected to `/dashboard?success=true`. The webhook will also be triggered to update the user's subscription status.

## Security Notes

1. **Never expose your secret key** in client-side code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS in production** for webhook endpoints
4. **Store sensitive data securely** in your database

## Production Deployment

1. Switch to live Stripe keys (remove `_test` suffix)
2. Update webhook endpoint to your production domain
3. Set up proper error handling and logging
4. Implement subscription management features
5. Add proper user authentication and authorization

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your secret key format
2. **"Price not found"**: Verify price IDs in your code
3. **"Webhook signature verification failed"**: Check webhook secret
4. **"CORS errors"**: Ensure proper domain configuration

### Testing Tips:

1. Use Stripe's test mode for development
2. Monitor webhook events in Stripe Dashboard
3. Check browser console for client-side errors
4. Check server logs for API errors

## Additional Features to Implement

1. **Subscription Management**: Allow users to upgrade/downgrade
2. **Payment History**: Show past invoices and payments
3. **Usage Tracking**: Monitor PR review usage
4. **Team Management**: Handle team subscriptions
5. **Refund Processing**: Handle refunds and disputes

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Community](https://community.stripe.com)

---

**Note**: This setup is for development/testing. For production, ensure you follow Stripe's security best practices and compliance requirements.

