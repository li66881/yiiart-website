import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://cc05127f2aaa9792e88b03986977d056@o4511202076655616.ingest.us.sentry.io/4511202084519936',

  // Performance monitoring
  tracesSampler: (samplingContext) => {
    if (process.env.NODE_ENV === 'development') return 1;
    return 0.1;
  },

  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
});
