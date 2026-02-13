/**
 * Safar App Configuration
 */

export const config = {
  // Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  // Analytics
  mixpanelToken: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? '',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',

  // Monetization
  revenuecatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',

  // App Info
  appName: 'Safar',
  appTagline: 'The journey from recitation to conversation.',
  appVersion: '1.0.0',

  // Legal
  privacyPolicyUrl: 'https://safar.app/privacy',
  termsOfServiceUrl: 'https://safar.app/terms',

  // Support
  supportEmail: 'support@safar.app',
  supportSubject: 'Safar App Support',
} as const;
