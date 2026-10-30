import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Stripe client for server code. Created on first use so builds work without the key.
 * Returns null when STRIPE_SECRET_KEY isn't set. Use test keys (sk_test_…) until launch.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
