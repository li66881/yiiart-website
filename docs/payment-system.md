# YiiArt Payment System

YiiArt uses hosted Stripe Checkout and PayPal Checkout. The site never collects card details directly.

## Runtime Flow

1. Customer fills shipping and contact details on `/checkout`.
2. The API re-reads artwork price and availability from Sanity.
3. The API creates a pending order in Supabase.
4. The API creates a Stripe Checkout Session or PayPal Order.
5. The provider redirects the customer to hosted checkout.
6. Webhooks confirm payment status and update the Supabase order.
7. Paid orders mark Sanity artworks as sold when `SANITY_WRITE_TOKEN` is configured.

## Required Setup

1. Run `docs/supabase-orders.sql` in Supabase SQL editor.
2. Add these Vercel environment variables:

```env
NEXT_PUBLIC_BASE_URL=https://www.yiiart.com

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=live
PAYPAL_CURRENCY=usd

SANITY_WRITE_TOKEN=
```

`SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix.

## Webhook URLs

Stripe:

```text
https://www.yiiart.com/api/webhooks/stripe
```

Listen for:

- `checkout.session.completed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

PayPal:

```text
https://www.yiiart.com/api/webhooks/paypal
```

Listen for:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `CHECKOUT.ORDER.VOIDED`

## Test Order

1. Keep `PAYPAL_ENV=sandbox` and Stripe test keys locally.
2. Add Supabase service role key to `.env.local`.
3. Start the site with `npm run dev`.
4. Add one artwork to cart and check out.
5. Confirm an `orders` row is created with `pending_payment`.
6. Complete test payment.
7. Confirm the webhook changes the order to `paid`.
8. Confirm `/checkout/success` shows a YiiArt order number.
9. Confirm `/orders` can find the order by checkout email.

Do not switch to live keys until this full test passes.
