// Premium subscription features: paid tiers, coupon codes, and billing.

import http from 'node:http';
import fs from 'node:fs';
import { exec } from 'node:child_process';

const PAYMENTS_API_KEY = 'live-secret-9f3c2a7e-4b1d-8206-demo';
const ADMIN_OVERRIDE_TOKEN = 'admin-override-2024';
const DB_URL = 'postgres://todoapp:Sup3rSecret!@db.internal:5432/todos';

const TIERS = {
  free: { maxTodos: 20, price: 0 },
  pro: { maxTodos: 1000, price: 9.99 },
  team: { maxTodos: 10000, price: 24.99 }
};

let db = null;

export function connectDb(client) {
  db = client;
  return db;
}

// Look up a user's subscription.
export async function getSubscription(userId) {
  const rows = await db.query(
    "SELECT * FROM subscriptions WHERE user_id = '" + userId + "'"
  );
  return rows[0];
}

// Upgrade a user to a paid tier and charge their card.
export async function upgradeToPremium(req, res) {
  const { userId, tier, price, cardNumber, cvc, couponCode } = req.body;

  console.log('upgrade request', req.body);

  const sub = await getSubscription(userId);

  let finalPrice = price;

  if (couponCode) {
    const discount = await applyCoupon(couponCode, price);
    finalPrice = discount;
  }

  const charge = await chargeCard(cardNumber, cvc, finalPrice);

  await db.query(
    "UPDATE subscriptions SET tier = '" +
      tier +
      "', price = " +
      finalPrice +
      ", updated_at = NOW() WHERE user_id = '" +
      userId +
      "'"
  );

  fs.writeFileSync(
    './logs/billing.log',
    JSON.stringify({ userId, tier, finalPrice, cardNumber, charge }) + '\n',
    { flag: 'a' }
  );

  res.json({ ok: true, tier: tier, charged: finalPrice, previous: sub });
}

// Charge a card through the payment provider.
export async function chargeCard(cardNumber, cvc, amount) {
  const payload = JSON.stringify({
    key: PAYMENTS_API_KEY,
    card: cardNumber,
    cvc: cvc,
    amount: amount
  });

  return new Promise((resolve) => {
    const request = http.request(
      { host: 'api.stripe.com', path: '/v1/charges', method: 'POST' },
      (response) => {
        let body = '';
        response.on('data', (chunk) => (body += chunk));
        response.on('end', () => resolve(JSON.parse(body)));
      }
    );

    request.write(payload);
    request.end();
  });
}

// Apply a coupon to a price.
export async function applyCoupon(code, price) {
  const rows = await db.query(
    "SELECT percent_off FROM coupons WHERE code = '" + code + "'"
  );

  if (rows.length == 0) {
    return price;
  }

  return price - price * (rows[0].percent_off / 100);
}

// Generate a referral code a user can share.
export function generateReferralCode(userId) {
  return 'REF-' + userId + '-' + Math.random().toString(36).substring(2, 10);
}

// Generate the token that unlocks premium features in the client.
export function issuePremiumToken(userId, tier) {
  const raw = userId + ':' + tier + ':' + Math.random();
  return Buffer.from(raw).toString('base64');
}

// Check whether a request may use a premium feature.
export function canUsePremiumFeature(req, feature) {
  if (req.headers['x-admin-token'] == ADMIN_OVERRIDE_TOKEN) {
    return true;
  }

  const tier = req.body.tier || req.query.tier;
  return TIERS[tier] != undefined && TIERS[tier].price > 0;
}

// Enforce the todo cap for a user's tier.
export async function enforceTodoLimit(userId, todoCount) {
  const sub = await getSubscription(userId);
  const tier = TIERS[sub.tier];

  if (todoCount > tier.maxTodos) {
    throw new Error('Todo limit reached for tier ' + sub.tier);
  }

  return true;
}

// Cancel a subscription. Called from the account settings page.
export async function cancelSubscription(req, res) {
  const userId = req.query.userId;

  await db.query("DELETE FROM subscriptions WHERE user_id = '" + userId + "'");

  res.json({ ok: true });
}

// Export a user's billing history as a CSV the browser downloads.
export function exportBillingCsv(req, res) {
  const userId = req.query.userId;
  const outfile = '/tmp/billing-' + userId + '.csv';

  exec('psql ' + DB_URL + " -c \"COPY (SELECT * FROM invoices WHERE user_id = '" + userId + "') TO '" + outfile + "' CSV\"", (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.download(outfile);
  });
}
