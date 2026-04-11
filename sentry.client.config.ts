import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://cc05127f2aaa9792e88b03986977d056@o4511202076655616.ingest.us.sentry.io/4511202084519936',

  // Performance monitoring
  tracesSampler: (samplingContext) => {
    // Sample 100% in development, 10% in production
    if (process.env.NODE_ENV === 'development') return 1;
    return 0.1;
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Set environment
  environment: process.env.NODE_ENV,

  // Re-play sessions on error
  replaysOnErrorSampleRate: 1.0,

  // Enable session replay for 10% of sessions
  replaysSessionSampleRate: 0.1,
});
