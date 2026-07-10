"use client";

import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { usePoints } from "@/hooks/use-points";

export function useLearnerSession() {
  const auth = usePhoneAuth();
  const points = usePoints();

  const isAuthenticated = auth.signedIn;
  const showLoginGate = !auth.loading && !auth.signedIn;

  return {
    auth,
    points,
    phoneAuthRequired: auth.phoneAuthAvailable,
    isAuthenticated,
    showLoginGate,
    showProfileSetup: isAuthenticated && !points.isProfileComplete,
  };
}
