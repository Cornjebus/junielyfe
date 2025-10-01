import posthog from 'posthog-js';

/**
 * Initialize PostHog analytics
 * Should be called once on app load (client-side only)
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    console.warn('PostHog not configured. Skipping analytics initialization.');
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only', // Only create profiles for identified users
    capture_pageview: false, // We'll capture pageviews manually
    capture_pageleave: true,
    autocapture: false, // Disable autocapture for privacy
    disable_session_recording: true, // Disable session recording for privacy
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug(); // Enable debug mode in development
      }
    },
  });
}

/**
 * Identify user with Clerk ID
 */
export function identifyUser(clerkUserId: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  posthog.identify(clerkUserId, properties);
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  posthog.capture(eventName, properties);
}

/**
 * Reset PostHog (on logout)
 */
export function resetPostHog() {
  if (typeof window === 'undefined') return;

  posthog.reset();
}

export { posthog };
