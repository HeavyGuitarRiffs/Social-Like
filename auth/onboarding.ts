export function needsOnboarding(profile: { onboarding_completed?: boolean } | null) {
  return !profile?.onboarding_completed;
}
