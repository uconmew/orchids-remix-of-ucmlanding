import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const DONATION_TIERS = {
  supporter: { name: 'Supporter', amount: 2500, description: 'Help provide meals and basic necessities' },
  partner: { name: 'Partner', amount: 5000, description: 'Support counseling and mentorship programs' },
  advocate: { name: 'Advocate', amount: 10000, description: 'Help provide housing support' },
  champion: { name: 'Champion', amount: 25000, description: 'Invest in leadership development' },
} as const;

export type DonationTier = keyof typeof DONATION_TIERS;

export async function getOrCreateCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  const existingCustomers = await stripe.customers.list({ email, limit: 1 });
  
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }
  
  return stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: 'ucon_ministries_donations',
    },
  });
}

export async function createDonationPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerEmail: string,
  customerName?: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const customer = await getOrCreateCustomer(customerEmail, customerName);
  
  return stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    metadata: {
      type: 'one_time_donation',
      donor_email: customerEmail,
      donor_name: customerName || 'Anonymous',
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function createDonationSubscription(
  amount: number,
  interval: 'month' | 'year',
  customerEmail: string,
  customerName?: string,
  metadata?: Record<string, string>
): Promise<{ subscription: Stripe.Subscription; clientSecret: string }> {
  const customer = await getOrCreateCustomer(customerEmail, customerName);
  
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      type: 'recurring_donation',
      donor_email: customerEmail,
      donor_name: customerName || 'Anonymous',
      interval,
      amount: amount.toString(),
      ...metadata,
    },
  });

  const price = await stripe.prices.create({
    unit_amount: amount,
    currency: 'usd',
    recurring: { interval },
    product_data: {
      name: `UCon Ministries ${interval === 'month' ? 'Monthly' : 'Annual'} Donation - $${(amount / 100).toFixed(2)}`,
      metadata: {
        type: 'recurring_donation',
      },
    },
  });
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    metadata: {
      type: 'recurring_donation',
      donor_email: customerEmail,
      donor_name: customerName || 'Anonymous',
      interval,
      setup_intent_id: setupIntent.id,
      ...metadata,
    },
  });
  
  return {
    subscription,
    clientSecret: setupIntent.client_secret!,
  };
}

export async function cancelDonationSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  });
}