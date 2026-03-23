'use client'

interface ResolutionRateGaugeProps {
    percentage: number
    title?: string
    subtitle?: string
}

export function ResolutionRateGauge({ percentage, title = "Resolution Rate", subtitle = "On track for 80% target" }: ResolutionRateGaugeProps) {
    const radius = 52
    const stroke = 9
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const stats = [
        { label: 'Resolved', value: `${percentage}%`, color: 'text-emerald-600' },
        { label: 'Target', value: '80%', color: 'text-blue-600' },
        { label: 'Remaining', value: `${80 - percentage}%`, color: 'text-amber-500' },
    ]

    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{title}</h3>
                <button className="text-[10px] font-black text-blue-500 uppercase tracking-wider hover:text-blue-700 transition-colors">
                    Details →
                </button>
            </div>

            {/* Gauge + Stats side by side */}
            <div className="flex items-center gap-5">
                {/* SVG Gauge */}
                <div className="relative flex-shrink-0">
                    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-sm">
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="50%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#6ee7b7" />
                            </linearGradient>
                        </defs>
                        {/* Background track */}
                        <circle
                            stroke="#f3f4f6"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset: 0 }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            strokeLinecap="round"
                        />
                        {/* Progress arc */}
                        <circle
                            stroke="url(#gaugeGradient)"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-gray-900 leading-none">{percentage}%</span>
                    </div>
                </div>

                {/* Stats column */}
                <div className="flex-1 space-y-3">
                    {stats.map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-gray-400">{s.label}</span>
                            <span className={`text-[12px] font-black ${s.color}`}>{s.value}</span>
                        </div>
                    ))}
                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-700"
                            style={{ width: `${(percentage / 80) * 100}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}
