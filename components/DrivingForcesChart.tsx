import React from 'react'

interface DrivingForcesChartProps {
  scores: Record<string, number> | null | undefined
  title?: string
  subtitle?: string
}

interface DrivingForcePairConfig {
  motivator: string
  centerLabel: string
  leftCode: string
  rightCode: string
  leftLabel: string
  rightLabel: string
  color: string
  description: string
}

const DRIVING_FORCE_PAIRS: DrivingForcePairConfig[] = [
  {
    motivator: 'Knowledge',
    centerLabel: 'Theoretical',
    leftCode: 'KI',
    rightCode: 'KN',
    leftLabel: 'Instinctive',
    rightLabel: 'Intellectual',
    color: '#b91c1c',
    description:
      'Instinctive relies on past experience and gut feel, while Intellectual is energized by learning, research, and theory.',
  },
  {
    motivator: 'Utility',
    centerLabel: 'Utilitarian',
    leftCode: 'US',
    rightCode: 'UR',
    leftLabel: 'Selfless',
    rightLabel: 'Resourceful',
    color: '#b45309',
    description:
      'Selfless is motivated by helping and completing tasks regardless of personal return, while Resourceful looks for efficiency and strong ROI.',
  },
  {
    motivator: 'Surroundings',
    centerLabel: 'Aesthetic',
    leftCode: 'SO',
    rightCode: 'SH',
    leftLabel: 'Objective',
    rightLabel: 'Harmonious',
    color: '#7e22ce',
    description:
      'Objective cares most about function and practicality, while Harmonious values beauty, balance, and how the environment feels.',
  },
  {
    motivator: 'Others',
    centerLabel: 'Social',
    leftCode: 'OI',
    rightCode: 'OA',
    leftLabel: 'Intentional',
    rightLabel: 'Altruistic',
    color: '#047857',
    description:
      'Intentional helps others to achieve specific outcomes, while Altruistic is driven to support people simply because they care.',
  },
  {
    motivator: 'Power',
    centerLabel: 'Individualistic',
    leftCode: 'PC',
    rightCode: 'PD',
    leftLabel: 'Collaborative',
    rightLabel: 'Commanding',
    color: '#111827',
    description:
      'Collaborative prefers shared influence and supporting the team, while Commanding seeks autonomy, status, and clear authority.',
  },
  {
    motivator: 'Methodologies',
    centerLabel: 'Traditional',
    leftCode: 'MR',
    rightCode: 'MS',
    leftLabel: 'Receptive',
    rightLabel: 'Structured',
    color: '#4b5563',
    description:
      'Receptive embraces new ideas and flexible approaches, while Structured prefers proven systems, traditions, and consistency.',
  },
]

const clampPercentage = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 50
  return Math.max(0, Math.min(100, Math.round(value)))
}

const DrivingForcesChart: React.FC<DrivingForcesChartProps> = ({ scores, title, subtitle }) => {
  if (!scores) {
    return null
  }

  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="text-center mb-2">
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-6">
        {DRIVING_FORCE_PAIRS.map((pair) => {
          const leftRaw = Number(scores[pair.leftCode] ?? 0)
          const rightRaw = Number(scores[pair.rightCode] ?? 0)
          const total = leftRaw + rightRaw

          let leftPct = 50
          let rightPct = 50

          if (total > 0) {
            leftPct = clampPercentage((leftRaw / total) * 100)
            rightPct = clampPercentage((rightRaw / total) * 100)
          }

          // Position of the indicator on the 0–100 scale (0 = fully left, 100 = fully right)
          const indicatorPosition = clampPercentage(rightPct)

          return (
            <div key={pair.motivator} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {pair.motivator}
                </div>
                <div className="text-[11px] font-medium text-slate-400">{pair.centerLabel}</div>
              </div>

              <div className="flex items-center gap-4">
                {/* Left side */}
                <div className="flex flex-col items-center w-20">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: pair.color }}
                  >
                    {leftPct}
                  </div>
                  <div className="mt-1 text-center text-xs font-medium text-slate-700 leading-tight">
                    {pair.leftLabel}
                  </div>
                </div>

                {/* Scale */}
                <div className="flex-1">
                  <div className="relative flex h-7 items-center">
                    {/* Base track */}
                    <div className="absolute inset-x-0 h-1 rounded-full bg-slate-200" />

                    {/* Filled segment toward the dominant side */}
                    <div
                      className="absolute h-1 rounded-full"
                      style={{
                        left: 0,
                        width: `${indicatorPosition}%`,
                        backgroundColor: pair.color,
                      }}
                    />

                    {/* Ticks */}
                    {[0, 25, 50, 75, 100].map((value) => (
                      <div
                        key={value}
                        className="absolute h-3 w-px bg-slate-300"
                        style={{
                          left: `${value}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    ))}

                    {/* Indicator knob */}
                    <div
                      className="absolute h-4 w-4 rounded-full border-2 border-white shadow-md"
                      style={{
                        left: `${indicatorPosition}%`,
                        transform: 'translateX(-50%)',
                        backgroundColor: pair.color,
                      }}
                    />
                  </div>

                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-center w-20">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: pair.color }}
                  >
                    {rightPct}
                  </div>
                  <div className="mt-1 text-center text-xs font-medium text-slate-700 leading-tight">
                    {pair.rightLabel}
                  </div>
                </div>
              </div>
              <p className="text-[11px] leading-snug text-slate-500">
                {pair.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DrivingForcesChart


