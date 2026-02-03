export default function StreakHeatmap() {
  // fake data for now
  const days = [
    { day: "M", count: 3 },
    { day: "T", count: 2 },
    { day: "W", count: 3 },
    { day: "T", count: 1 },
    { day: "F", count: 3 },
    { day: "S", count: 0 },
    { day: "S", count: 2 },
  ]

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h3 className="card-title">🔥 Weekly Consistency</h3>

        <div className="flex justify-between mt-4">
          {days.map((d, i) => (
            <div
              key={i}
              className="tooltip tooltip-top"
              data-tip={`${d.count} comments`}
            >
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold transition
                  ${d.count === 0
                    ? "bg-base-300"
                    : d.count < 3
                    ? "bg-success/50"
                    : "bg-success text-success-content"}
                `}
              >
                {d.day}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs opacity-70 mt-3">
          Post daily to keep your streak alive
        </p>
      </div>
    </div>
  )
}
