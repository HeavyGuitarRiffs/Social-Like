export default function StreakFreezeCard({ freezes }: { freezes: number }) {
  return (
    <div className="card bg-warning/10 border-warning">
      <div className="card-body">
        <h3 className="card-title">🧊 Streak Freeze</h3>
        <p>{freezes} freezes remaining</p>

        {freezes === 0 && (
          <button className="btn btn-warning btn-sm">
            Upgrade to protect streaks
          </button>
        )}
      </div>
    </div>
  )
}