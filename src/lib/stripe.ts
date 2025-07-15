// Stripe functionality disabled - payment features removed
// import Stripe from "stripe";
// import { env } from "@/env";

// const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
//   apiVersion: "2024-06-20",
//   typescript: true,
// });

// Mock stripe object to prevent import errors
const stripe = {
  // Mock methods to prevent runtime errors
};

export default stripe;