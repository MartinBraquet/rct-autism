import React from 'react'
import {EffectForest} from 'web/components/study-results/effect-forest'
import {ALL_PREPS, PREP_META, RESULTS, signed} from 'web/components/study-results/results-data'

const cardTitle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.05rem',
  fontWeight: 600,
  color: '#1e1a14',
  marginBottom: '0.3rem',
}

const cardSubtitle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#bab2a0',
  marginBottom: '1.5rem',
}

export function GroupResults() {
  const {group, stop_counts: stops} = RESULTS
  const stats = [
    {value: RESULTS.n_children, label: 'Children enrolled'},
    {value: RESULTS.n_sessions, label: 'Sessions rated'},
    {value: stops.superiority ?? 0, label: 'Clear winner found'},
    {value: stops.rope ?? 0, label: 'Prep made no difference'},
    {value: stops.continue ?? 0, label: 'Inconclusive'},
  ]
  const maxRaw = 10

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="study-chart-card" style={{padding: '1.25rem'}}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: '#3d5a45',
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{color: '#7a7060'}}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid gap-8"
        style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}
      >
        <div className="study-chart-card">
          <h3 style={cardTitle}>Group-level effect of each preparation</h3>
          <p style={cardSubtitle}>
            Bayesian model estimate across all children, adjusted for practitioner and age
          </p>
          <EffectForest effects={group.effects} />
        </div>

        <div className="study-chart-card">
          <h3 style={cardTitle}>Raw average engagement</h3>
          <p style={cardSubtitle}>Mean BRES-10 score per condition (1–10), before modelling</p>
          <div className="flex flex-col gap-4">
            {ALL_PREPS.map((prep) => {
              const r = group.raw[prep]
              const {label, color} = PREP_META[prep]
              return (
                <div key={prep} className="grid grid-cols-[84px_1fr_64px] items-center gap-3">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="h-3 rounded-full" style={{background: '#e8dece'}}>
                    <div
                      className="h-3 rounded-full"
                      style={{width: `${((r.mean ?? 0) / maxRaw) * 100}%`, background: color}}
                    />
                  </div>
                  <span
                    className="text-right text-xs"
                    style={{fontFamily: "'DM Mono', monospace", color: '#7a7060'}}
                  >
                    {r.mean?.toFixed(2)} <span style={{color: '#bab2a0'}}>n={r.n}</span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed" style={{color: '#7a7060'}}>
            All four conditions average between 5.2 and 5.5, while scores within any single
            condition spread widely (standard deviation ≈ 2 points).
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '1.5rem',
          background: 'rgba(61, 90, 69, 0.05)',
          border: '1px solid rgba(61, 90, 69, 0.15)',
          borderRadius: 16,
        }}
      >
        <p style={{fontSize: '0.95rem', lineHeight: 1.75, color: '#3d5a45'}}>
          <strong>What this means:</strong> none of the three warm-ups changed engagement in a
          detectable way. The best estimates range from {signed(group.effects.Calming.mean)}{' '}
          (Calming) to {signed(group.effects.Stimulating.mean)} (Stimulating) points on a 10-point
          scale, and every 95% interval includes zero. It does not show that warm-ups never help:
          the study could not tell a small or child-specific benefit apart from noise.
        </p>
      </div>
    </div>
  )
}
