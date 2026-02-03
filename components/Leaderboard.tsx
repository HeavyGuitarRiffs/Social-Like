export default function Leaderboard() {
  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">🏆 Weekly Leaderboard</h3>

        <ul className="space-y-3">
          <li className="flex justify-between">
            <span>🔥 @you</span>
            <span className="font-bold">6 days</span>
          </li>
          <li className="flex justify-between opacity-60">
            <span>@creatorA</span>
            <span>5 days</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
