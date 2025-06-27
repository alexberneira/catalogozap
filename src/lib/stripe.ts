import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export default stripe

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID! 