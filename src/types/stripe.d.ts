// Stripe types for missing modules
declare module '@stripe/react-stripe-js' {
  export const Elements: React.ComponentType<any>;
  export const CardElement: React.ComponentType<any>;
  export const useStripe: () => any;
  export const useElements: () => any;
}

declare module '@stripe/stripe-js' {
  export interface Stripe {
    [key: string]: any;
  }
  export const loadStripe: (key: string) => Promise<Stripe | null>;
}