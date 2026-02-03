export function getStreakMessage({
  commentsDone,
  goal,
  isLate,
}: {
  commentsDone: number
  goal: number
  isLate: boolean
}) {
  if (commentsDone >= goal) {
    return "🔥 Streak secured for today"
  }

  if (isLate) {
    return `⚠️ ${goal - commentsDone} comments left — streak ends tonight`
  }

  return `Reply to ${goal - commentsDone} comments to keep your streak`
}
