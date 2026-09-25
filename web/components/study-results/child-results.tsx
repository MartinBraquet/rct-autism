import React, {useState} from 'react'
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi'
import {EffectForest} from 'web/components/study-results/effect-forest'
import {ALL_PREPS, ChildResult, pct, PREP_META, RESULTS} from 'web/components/study-results/results-data'

const MIN_SESSIONS = 12

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', timeZone: 'UTC'})

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
  marginBottom: '1.25rem',
}

function verdict(child: ChildResult) {
  if (child.stop_reason === 'superiority') {
    return {
      label: `Winner: ${PREP_META[child.best_prep as keyof typeof PREP_META]?.label}`,
      className: 'stop-sup',
      text: 'One preparation was clearly best for this child.',
    }
  }
  if (child.stop_reason === 'rope') {
    return {
      label: 'No meaningful difference',
      className: 'stop-rope',
      text: `Every warm-up is very likely within ±${RESULTS.rope} point of No Prep. For this child, the choice of warm-up does not appear to matter, so skipping it is a reasonable default.`,
    }
  }
  return {
    label: 'Inconclusive',
    className: 'stop-aipe',
    text:
      child.n_sessions < MIN_SESSIONS
        ? `Only ${child.n_sessions} session${child.n_sessions === 1 ? '' : 's'}, below the ${MIN_SESSIONS}-session minimum. The estimates below mostly reflect the group average, not this child.`
        : 'Not enough evidence either way. No preparation stands out, but a moderate effect cannot be ruled out.',
  }
}

// Each rated session as a dot on the 1–10 engagement scale, grouped by condition.
function SessionStrip({child}: {child: ChildResult}) {
  const x = (v: number) => `${((v - 1) / 9) * 100}%`
  return (
    <div className="flex flex-col gap-3">
      {ALL_PREPS.map((prep) => {
        const {label, color} = PREP_META[prep]
        const raw = child.raw[prep]
        const values = child.sessions.filter((s) => s.prep === prep).map((s) => s.engagement)
        return (
          <div
            key={prep}
            className="grid grid-cols-[84px_1fr_64px] sm:grid-cols-[110px_1fr_92px] items-center gap-3"
          >
            <span className="text-sm font-medium">{label}</span>
            <div className="relative h-6 rounded" style={{background: '#f3ece0'}}>
              {values.map((v, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{left: x(v), background: color, opacity: 0.55}}
                />
              ))}
              {raw.mean !== null && (
                <div
                  className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded"
                  style={{left: x(raw.mean), background: '#1e1a14'}}
                  title={`Mean ${raw.mean.toFixed(2)}`}
                />
              )}
            </div>
            <span
              className="text-right text-xs"
              style={{fontFamily: "'DM Mono', monospace", color: '#7a7060'}}
            >
              {raw.mean !== null ? raw.mean.toFixed(1) : '—'}{' '}
              <span style={{color: '#bab2a0'}}>n={raw.n}</span>
            </span>
          </div>
        )
      })}
      <div className="grid grid-cols-[84px_1fr_64px] sm:grid-cols-[110px_1fr_92px] gap-3">
        <span />
        <div className="relative h-4">
          {[1, 4, 7, 10].map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[11px]"
              style={{left: x(t), fontFamily: "'DM Mono', monospace", color: '#bab2a0'}}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProbabilityBest({child}: {child: ChildResult}) {
  return (
    <div className="flex flex-col gap-3">
      {ALL_PREPS.map((prep) => {
        const {label, color} = PREP_META[prep]
        const p = child.p_best[prep]
        return (
          <div key={prep} className="grid grid-cols-[84px_1fr_48px] items-center gap-3">
            <span className="text-sm font-medium">{label}</span>
            <div className="relative h-3 rounded-full" style={{background: '#e8dece'}}>
              <div className="h-3 rounded-full" style={{width: pct(p), background: color}} />
              <div
                className="absolute -inset-y-1 w-px"
                style={{left: '90%', background: '#1e1a14', opacity: 0.35}}
              />
            </div>
            <span
              className="text-right text-xs"
              style={{fontFamily: "'DM Mono', monospace", color: '#7a7060'}}
            >
              {pct(p)}
            </span>
          </div>
        )
      })}
      <p className="text-xs leading-relaxed mt-1" style={{color: '#7a7060'}}>
        A recommendation needed one condition to reach 90% (marked line).
      </p>
    </div>
  )
}

export function ChildResults() {
  const children = RESULTS.children
  const [index, setIndex] = useState(0)
  const child = children[index]
  const v = verdict(child)
  const go = (delta: number) => setIndex((i) => (i + delta + children.length) % children.length)

  const navButton =
    'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[#3d5a45] hover:text-[#faf6f0]'

  return (
    <div
      className="study-chart-card"
      style={{background: '#fffef9'}}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          className={navButton}
          style={{border: '1px solid #e8dece', color: '#3d5a45'}}
          aria-label="Previous child"
        >
          <FiChevronLeft /> <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="text-center" aria-live="polite">
          <div
            style={{fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700}}
          >
            Child {child.id}
          </div>
          <div className="text-xs" style={{color: '#bab2a0'}}>
            {index + 1} of {children.length}
          </div>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className={navButton}
          style={{border: '1px solid #e8dece', color: '#3d5a45'}}
          aria-label="Next child"
        >
          <span className="hidden sm:inline">Next</span> <FiChevronRight />
        </button>
      </div>

      <div
        className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl p-4"
        style={{background: '#faf6f0'}}
      >
        <span
          className={`${v.className} inline-block self-start sm:self-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider`}
        >
          {v.label}
        </span>
        <p className="text-sm leading-relaxed" style={{color: '#5a5040'}}>
          <strong>
            {child.n_sessions} session{child.n_sessions === 1 ? '' : 's'}
          </strong>{' '}
          ({formatDate(child.first_date)}
          {child.first_date !== child.last_date && ` – ${formatDate(child.last_date)}`}). {v.text}
        </p>
      </div>

      <div
        className="grid gap-8 mt-8"
        style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}
      >
        <div>
          <h3 style={cardTitle}>Estimated effect for this child</h3>
          <p style={cardSubtitle}>Group effect plus this child&apos;s own deviation</p>
          <EffectForest effects={child.effects} />
        </div>
        <div>
          <h3 style={cardTitle}>Probability each condition is best</h3>
          <p style={cardSubtitle}>Share of posterior draws in which it scores highest</p>
          <ProbabilityBest child={child} />
        </div>
      </div>

      <div className="mt-8">
        <h3 style={cardTitle}>Every rated session</h3>
        <p style={cardSubtitle}>
          Each dot is one session&apos;s engagement score (1–10); the dark tick is the average
        </p>
        <SessionStrip child={child} />
      </div>
    </div>
  )
}
