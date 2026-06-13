# YiiArt Payment System

YiiArt uses hosted payment pages only. The site never collects card details directly.

For the current China-registered company setup, production checkout is PayPal-first with a manual invoice fallback. Stripe card checkout is optional and hidden unless it is explicitly enabled.

## Runtime Flow

1. Customer fills shipping and contact details on `/checkout`.
2. The checkout page reads `/api/checkout/config` to decide which payment methods are available.
3. The API re-reads artwork price, checkout permission, and availability from Sanity.
4. If Supabase orders are configured, the API creates a pending order.
5. PayPal redirects the customer to hosted checkout, or manual invoice opens WhatsApp with order details.
6. PayPal webhooks confirm payment status and update the Supabase order.
7. Paid orders mark Sanity artworks as sold when `SANITY_WRITE_TOKEN` is configured.

## Recommended Production Order

1. Run `docs/supabase-orders.sql` in Supabase SQL editor.
2. Add Supabase and base URL variables in Vercel.
3. Keep manual invoice enabled so customers can still contact YiiArt if PayPal is pending review.
4. Add PayPal live credentials after the PayPal business account is approved.
5. Add the PayPal webhook URL and webhook ID.
6. Test one live low-value order or sandbox order before advertising direct checkout.
7. Enable Stripe only if the Stripe account/entity is approved and you want card checkout visible.

## Required Environment Variables

```env
NEXT_PUBLIC_BASE_URL=https://www.yiiart.com

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=live
PAYPAL_CURRENCY=usd
ENABLE_PAYPAL_CHECKOUT=true

ENABLE_MANUAL_INVOICE_REQUESTS=true

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd
ENABLE_STRIPE_CHECKOUT=false

SANITY_WRITE_TOKEN=
```

`SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix.

## Payment Method Rules

- PayPal is shown only when PayPal credentials and Supabase order storage are both configured, and `ENABLE_PAYPAL_CHECKOUT` is not `false`.
- Manual invoice is shown by default when `ENABLE_MANUAL_INVOICE_REQUESTS` is not `false`. It opens WhatsApp and creates a Supabase order when order storage is ready.
- Stripe card checkout is hidden by default. It appears only when `ENABLE_STRIPE_CHECKOUT=true`, `STRIPE_SECRET_KEY` is set, and Supabase order storage is configured.
- Product pages show direct checkout only when the artwork has a valid price, `allowCheckout` is not false, and availability is not sold or actively reserved.

## Health Checks

Checkout config:

```text
https://www.yiiart.com/api/checkout/config
```

Stripe webhook health:

```text
https://www.yiiart.com/api/webhooks/stripe
```

PayPal webhook health:

```text
https://www.yiiart.com/api/webhooks/paypal
```

## Webhook URLs

PayPal:

```text
https://www.yiiart.com/api/webhooks/paypal
```

Listen for:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `CHECKOUT.ORDER.VOIDED`

Stripe, only if card checkout is enabled:

```text
https://www.yiiart.com/api/webhooks/stripe
```

Listen for:

- `checkout.session.completed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

## Test Order

1. Keep `PAYPAL_ENV=sandbox` locally until PayPal sandbox checkout passes.
2. Add Supabase service role key to `.env.local`.
3. Start the site with `npm run dev`.
4. Add one available, priced artwork to cart and check out.
5. Confirm an `orders` row is created with `pending_payment`.
6. Complete PayPal sandbox payment.
7. Confirm the webhook changes the order to `paid`.
8. Confirm `/checkout/success` shows a YiiArt order number.
9. Confirm `/orders` can find the order by checkout email.
10. Test manual invoice and confirm WhatsApp opens with the order details.

Do not switch to live PayPal keys until this full test passes.
