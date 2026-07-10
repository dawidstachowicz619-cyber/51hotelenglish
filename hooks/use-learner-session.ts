"use client";

import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { usePoints } from "@/hooks/use-points";

export function useLearnerSession() {
  const auth = usePhoneAuth();
  const points = usePoints();

  const phoneAuthRequired = auth.phoneAuthAvailable;
  const isAuthenticated = phoneAuthRequired
    ? auth.signedIn
    : points.isProfileComplete;
  const showLoginGate =
    phoneAuthRequired && !auth.loading && !auth.signedIn;
  const showProfileSetup = isAuthenticated && !points.isProfileComplete;

  return {
    auth,
    points,
    phoneAuthRequired,
    isAuthenticated,
    showLoginGate,
    showProfileSetup,
  };
}
