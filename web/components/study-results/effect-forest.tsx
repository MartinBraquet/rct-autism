import React from 'react'
import {
  ACTIVE_PREPS,
  ActivePrep,
  PosteriorSummary,
  PREP_META,
  RESULTS,
  signed,
} from 'web/components/study-results/results-data'

export const FOREST_DOMAIN: [number, number] = [-2, 2.5]
const TICKS = [-2, -1, 0, 1, 2]

// Horizontal forest plot of preparation effects vs. No Prep, with the ROPE shaded.
// Thick bar = 80% credible interval, thin line = 95%, dot = posterior mean.
export function EffectForest({
  effects,
  domain = FOREST_DOMAIN,
}: {
  effects: Record<ActivePrep, PosteriorSummary>
  domain?: [number, number]
}) {
  const [min, max] = domain
  const x = (v: number) => `${((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100}%`
  const rope = RESULTS.rope

  return (
    <div>
      <div className="flex flex-col gap-4">
        {ACTIVE_PREPS.map((prep) => {
          const e = effects[prep]
          const {label, color} = PREP_META[prep]
          return (
            <div
              key={prep}
              className="grid grid-cols-[84px_1fr] sm:grid-cols-[110px_1fr_56px] items-center gap-3"
            >
              <span className="text-sm font-medium" style={{color: '#1e1a14'}}>
                {label}
              </span>
              <div className="relative h-7">
                <div
                  className="absolute inset-y-0"
                  style={{
                    left: x(-rope),
                    width: `calc(${x(rope)} - ${x(-rope)})`,
                    background: 'rgba(61,90,69,0.07)',
                  }}
                />
                <div
                  className="absolute inset-y-0 w-px"
                  style={{left: x(0), background: '#bab2a0'}}
                />
                <div
                  className="absolute top-1/2 h-[2px] -translate-y-1/2"
                  style={{
                    left: x(e.lo95),
                    width: `calc(${x(e.hi95)} - ${x(e.lo95)})`,
                    background: color,
                  }}
                />
                <div
                  className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full"
                  style={{
                    left: x(e.lo80),
                    width: `calc(${x(e.hi80)} - ${x(e.lo80)})`,
                    background: color,
                    opacity: 0.55,
                  }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{left: x(e.mean), background: color, borderColor: '#fffef9'}}
                  title={`${label}: ${signed(e.mean)} [${e.lo95.toFixed(2)}, ${e.hi95.toFixed(2)}]`}
                />
              </div>
              <span
                className="hidden sm:block text-right text-xs"
                style={{fontFamily: "'DM Mono', monospace", color: '#7a7060'}}
              >
                {signed(e.mean)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-[84px_1fr] sm:grid-cols-[110px_1fr_56px] gap-3 mt-2">
        <span />
        <div className="relative h-4">
          {TICKS.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[11px]"
              style={{left: x(t), fontFamily: "'DM Mono', monospace", color: '#bab2a0'}}
            >
              {t > 0 ? `+${t}` : t}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed" style={{color: '#7a7060'}}>
        Engagement points vs. No Prep. Dot = best estimate; thick bar = 80% credible interval; thin
        line = 95%. Shaded band = {`±${rope} point`}, the pre-registered zone of &ldquo;no
        meaningful difference&rdquo;.
      </p>
    </div>
  )
}
