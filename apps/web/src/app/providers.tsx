'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { initPostHog, identifyUser, resetPostHog } from '@/lib/posthog';

/**
 * Client-side providers
 * Initializes PostHog and tracks user identity
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    } else {
      resetPostHog();
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
