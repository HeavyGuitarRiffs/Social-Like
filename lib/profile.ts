export type UserProfile = {
  id?: string // later from auth
  displayName: string
  bio?: string
  country?: string
  timezone: string

  // Growth signals
  streakDays?: number
  totalComments?: number

  // Monetization flags (future)
  isPublic?: boolean
  rewardTier?: "free" | "pro" | "elite"

  createdAt?: string
  updatedAt?: string
}
