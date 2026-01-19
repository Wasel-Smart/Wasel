/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_ID: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_SENDGRID_API_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_VAPID_KEY: string
  readonly VITE_JUMIO_API_KEY: string
  readonly VITE_JUMIO_API_SECRET: string
  readonly VITE_MIXPANEL_TOKEN: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENABLE_MOCK_AUTH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}