import Image from 'next/image'
import React, {useEffect, useRef, useState} from 'react'
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts'
import {Col} from 'web/components/layout/col'
import {Row} from 'web/components/layout/row'
import {CustomLink} from 'web/components/links'

const protocolUrl =
  'https://github.com/MartinBraquet/rct-autism/releases/download/v1.0.0/protocol.pdf'

// const heroLinkStyle = {
//   color: '#1e1a14', // Match the surrounding text color
//   textDecoration: 'none',
//   borderBottom: '1px solid rgba(30, 26, 20, 0.2)', // Very subtle underline
//   transition: 'all 0.2s ease-in-out',
//   fontWeight: 500,
// }
//
// const heroLinkHoverStyle = {
//   borderBottom: '1px solid #1e1a14', // Darken the line on hover
//   color: '#5e5544', // Slight color shift to indicate it's clickable
// }

// ── DATA ──────────────────────────────────────────────────────
const SESSIONS = [12, 16, 20, 24, 28, 32, 36]
const POWER_DATA = {
  overall: [0.216, 0.487, 0.7, 0.783, 0.833, 0.869, 0.899],
  one_winner_strong: [0.468, 0.66, 0.801, 0.858, 0.908, 0.943, 0.957],
  multiple_winners: [0.171, 0.526, 0.793, 0.879, 0.91, 0.931, 0.95],
  one_winner_weak: [0.156, 0.328, 0.391, 0.516, 0.594, 0.641, 0.734],
  no_differential: [0.04, 0.08, 0.253, 0.333, 0.467, 0.573, 0.64],
}

const COLORS = {
  strong: '#b85c38',
  multi: '#4a8fa8',
  weak: '#d4874e',
  null: '#8b7fb8',
  overall: '#3d5a45',
}

const CONDITIONS = [
  {
    key: 'a',
    badge: 'Stimulating',
    title: 'High-Energy Input',
    activity: '⚡ Jumping & Body Massage',
    duration: '10 minutes',
    desc: 'Targets the vestibular and proprioceptive systems with movement and deep pressure. Ideal for children who are under-aroused or need activation before learning.',
  },
  {
    key: 'b',
    badge: 'Calming',
    title: 'Quiet & Fine Motor',
    activity: '🌿 Clay Modelling',
    duration: '10 minutes',
    desc: 'Gentle tactile input designed to reduce arousal. Well-suited for children who arrive hyperactive, anxious, or sensory-overloaded and need to settle before learning.',
  },
  {
    key: 'c',
    badge: 'Child-Led',
    title: 'Autonomy & Choice',
    activity: '🎯 Choice Board',
    duration: '10 minutes',
    desc: 'The child selects their own warm-up from a fixed menu of options. Builds agency and intrinsic motivation — a key factor in engagement for many children with autism.',
  },
  {
    key: 'd',
    badge: 'Control',
    title: 'No Preparation',
    activity: '— Standard Session Start',
    duration: '0 minutes',
    desc: 'The session begins immediately with no warm-up. This is the current standard of care and serves as our baseline for comparison. It may turn out to be optimal for some children.',
  },
]

const STEPS = [
  {
    n: 1,
    tag: 'Observation',
    title: 'Child arrives at the centre',
    body: "The rater (a trained observer who scores engagement) notes the child's arrival state: calm, tired, or hyperactive. This is recorded but does not change the assigned condition.",
  },
  {
    n: 2,
    tag: 'Intervention',
    title: '10-minute warm-up (or none)',
    body: 'The practitioner delivers the assigned preparation condition — Stimulating, Calming, Child-Led, or skips it entirely. The activity is one the child already does at the centre.',
  },
  {
    n: 3,
    tag: 'Learning session',
    title: '20-minute standardized learning block',
    body: 'The same structured curriculum — specific Discrete Trial Training tasks or tabletop work — is used in every session. The rater observes from a separate room, scoring engagement at 5, 15, and 30 minutes.',
  },
  {
    n: 4,
    tag: 'Measurement',
    title: 'Engagement is scored (1–10)',
    body: 'The rater assigns a BRES-10 score. The three scores are averaged into a single composite for that session. 20% of sessions are double-scored for reliability checks.',
  },
  {
    n: 5,
    tag: 'Stopping rule',
    title: 'Weekly Bayesian check',
    body: "Every Sunday, the model evaluates each child's data. If we're ≥90% confident in a winner — or confident that no prep truly makes a difference — we stop and implement the personal recommendation immediately.",
  },
]

const SCALE_ROWS = [
  {
    range: '9–10',
    label: 'Active / Independent',
    sub: 'eyes on task >90%, 0–1 prompts',
    pct: 100,
    color: '#3d5a45',
  },
  {
    range: '7–8',
    label: 'Steady / Supported',
    sub: 'eyes on task >75%, 2–3 prompts',
    pct: 80,
    color: '#6b8f71',
  },
  {range: '5–6', label: 'Inconsistent / Reactive', sub: '~50% on task', pct: 60, color: '#d4874e'},
  {
    range: '3–4',
    label: 'Passive / Disengaged',
    sub: '>50% off task, constant prompting',
    pct: 40,
    color: '#c49a72',
  },
  {
    range: '1–2',
    label: 'Active Refusal',
    sub: 'no engagement, visible distress',
    pct: 20,
    color: '#c4706e',
  },
]

const PROFILES = [
  {
    pct: '20%',
    cls: 'strong',
    title: 'One Clear Winner — Strong',
    desc: 'One preparation type is clearly and substantially better. The model typically resolves these children within 20 sessions.',
    stop: 'Superiority',
    stopCls: 'sup',
  },
  {
    pct: '10%',
    cls: 'weak',
    title: 'One Clear Winner — Subtle',
    desc: 'A best condition exists but the effect is modest. Requires more sessions to separate signal from noise.',
    stop: 'Superiority or AIPE',
    stopCls: 'sup',
  },
  {
    pct: '60%',
    cls: 'multi',
    title: 'Multiple Effective Options',
    desc: "Two or more warm-up types are equally beneficial. The recommendation is: 'use whichever is convenient.' Most children are expected to fall here.",
    stop: 'AIPE criterion',
    stopCls: 'aipe',
  },
  {
    pct: '10%',
    cls: 'null',
    title: 'No Differential Response',
    desc: "This child arrives well-regulated and doesn't need a warm-up. No Preparation is perfectly valid — and affirmed as a clinical choice.",
    stop: 'ROPE criterion',
    stopCls: 'rope',
  },
]

const SAFETY_ITEMS = [
  {
    icon: '🚫',
    title: 'Automatic condition removal',
    body: 'If a child scores ≤ 2 (active refusal/distress) for three consecutive sessions under any condition, that condition is immediately removed from their rotation. Parents are notified.',
  },
  {
    icon: '✋',
    title: 'Voluntary participation',
    body: "Participation is entirely voluntary. Withdrawing at any time has zero effect on your child's access to services or quality of care at the centre.",
  },
  {
    icon: '⏹️',
    title: 'Early stopping',
    body: "As soon as the model is confident in a recommendation, randomization stops immediately — your child doesn't continue in an experimental condition longer than needed.",
  },
  {
    icon: '🔒',
    title: 'No novel interventions',
    body: 'All four conditions are existing activities at the centre. We are not introducing anything new — only studying the timing and type of familiar activities.',
  },
  {
    icon: '📋',
    title: 'Ethical framework',
    body: "The study follows the Declaration of Helsinki. Written parental consent is required, and children's assent is sought in an age-appropriate way before enrolment.",
  },
  {
    icon: '👁️',
    title: 'Blinded scoring',
    body: 'The person scoring engagement does so from a separate room without knowing which warm-up was given — reducing the risk of biased observations.',
  },
]

const FAQS = [
  {
    q: 'Will my child always get the best warm-up?',
    a: 'During the study, your child will rotate through all four conditions so we can compare them. This means there will be sessions with a less-than-ideal warm-up. However, we stop as soon as we have enough evidence, and any condition causing distress is removed immediately.',
  },
  {
    q: 'How long will my child be in the study?',
    a: 'A maximum of 8 weeks, and in many cases less. The study stops for each child individually as soon as the statistical model is confident in a recommendation. Children attending at least 3 sessions per week are expected to have an answer within this window.',
  },
  {
    q: 'What happens after the study ends for my child?',
    a: 'Once a recommendation is made, the identified best preparation condition is implemented consistently before every session. You receive a plain-language summary of the findings for your child.',
  },
  {
    q: "What does 'randomized' mean for my child?",
    a: 'It means the order of warm-up conditions is determined by a pre-set algorithm (like shuffling cards), not by practitioner preference. This ensures a fair comparison. The same condition is never assigned two sessions in a row.',
  },
  {
    q: 'What if my child refuses a particular warm-up?',
    a: "If your child shows clear distress (scores ≤ 2 on the engagement scale) in three consecutive sessions under the same condition, that condition is permanently removed from their schedule. You and your child's practitioner will be informed immediately.",
  },
  {
    q: 'Is the learning session different during the study?',
    a: 'No. The 20-minute learning block that follows the warm-up uses the same structured curriculum every time. Only the warm-up varies. This ensures any differences in engagement we observe are due to the preparation, not the task.',
  },
  {
    q: 'Who can I contact with questions?',
    a: 'Please speak directly with Riki Dewan (Founder, Maya Care and Grow) or approach any member of the team. The full study protocol is also publicly available on GitHub.',
  },
]

const PowerCurve = () => {
  const sessions = SESSIONS
  const colors = COLORS
  const powerData = POWER_DATA
  // Recharts expects an array of objects where each object is a "point"
  const data = sessions.map((s, i) => ({
    name: `${s} sessions`,
    overall: +(powerData.overall[i] * 100).toFixed(1),
    strong: +(powerData.one_winner_strong[i] * 100).toFixed(1),
    multi: +(powerData.multiple_winners[i] * 100).toFixed(1),
    weak: +(powerData.one_winner_weak[i] * 100).toFixed(1),
    none: +(powerData.no_differential[i] * 100).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8dece" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{fill: '#bab2a0', fontSize: 12, fontFamily: 'DM Sans'}}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{fill: '#bab2a0', fontSize: 12, fontFamily: 'DM Mono'}}
          tickFormatter={(val) => `${val}%`}
          label={{
            value: 'Resolved (%)',
            angle: -90,
            position: 'insideLeft',
            fill: '#7a7060',
            fontFamily: 'DM Sans',
          }}
        />
        <Tooltip
          formatter={(value, name) => {
            const labelMap = {
              overall: 'Overall',
              strong: 'Strong response',
              multi: 'Multiple winners',
              weak: 'Weak response',
              none: 'No differential',
            }
            return [`${value}%`, (labelMap as any)[name] || name]
          }}
        />
        <Legend
          iconType="rect"
          wrapperStyle={{
            fontFamily: 'DM Sans',
            color: '#7a7060',
          }}
          formatter={(value) => {
            const labelMap = {
              overall: 'Overall',
              strong: 'Strong response',
              multi: 'Multiple winners',
              weak: 'Weak response',
              none: 'No differential',
            }
            return (labelMap as any)[value] || value
          }}
        />

        <Line
          type="monotone"
          dataKey="overall"
          stroke={colors.overall}
          strokeWidth={2.5}
          dot={{r: 3}}
          activeDot={{r: 5}}
        />
        <Line
          type="monotone"
          dataKey="strong"
          stroke={colors.strong}
          strokeDasharray="4 3"
          dot={{r: 2}}
        />
        <Line
          type="monotone"
          dataKey="multi"
          stroke={colors.multi}
          strokeDasharray="4 3"
          dot={{r: 2}}
        />
        <Line
          type="monotone"
          dataKey="weak"
          stroke={colors.weak}
          strokeDasharray="4 3"
          dot={{r: 2}}
        />
        <Line
          type="monotone"
          dataKey="none"
          stroke={colors.null}
          strokeDasharray="4 3"
          dot={{r: 2}}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── CHART INITIALIZATION ──────────────────────────────────────
function initCharts(Chart: any) {
  const font = {family: "'DM Sans', sans-serif"}
  const mono = {family: "'DM Mono', monospace"}
  const gridColor = '#e8dece'
  const tickColor = '#bab2a0'

  // Power curve
  const pc = document.getElementById('powerChart') as any
  if (pc && !pc._chartjs) {
    new Chart(pc, {
      type: 'line',
      data: {
        labels: SESSIONS.map((s) => `${s} sessions`),
        datasets: [
          {
            label: 'Overall',
            data: POWER_DATA.overall.map((v) => +(v * 100).toFixed(1)),
            borderColor: COLORS.overall,
            borderWidth: 2.5,
            pointRadius: 3,
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Strong response',
            data: POWER_DATA.one_winner_strong.map((v) => +(v * 100).toFixed(1)),
            borderColor: COLORS.strong,
            borderWidth: 1.5,
            pointRadius: 2,
            borderDash: [4, 3],
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Multiple winners',
            data: POWER_DATA.multiple_winners.map((v) => +(v * 100).toFixed(1)),
            borderColor: COLORS.multi,
            borderWidth: 1.5,
            pointRadius: 2,
            borderDash: [4, 3],
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Weak response',
            data: POWER_DATA.one_winner_weak.map((v) => +(v * 100).toFixed(1)),
            borderColor: COLORS.weak,
            borderWidth: 1.5,
            pointRadius: 2,
            borderDash: [4, 3],
            tension: 0.4,
            fill: false,
          },
          {
            label: 'No differential',
            data: POWER_DATA.no_differential.map((v) => +(v * 100).toFixed(1)),
            borderColor: COLORS.null,
            borderWidth: 1.5,
            pointRadius: 2,
            borderDash: [4, 3],
            tension: 0.4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {labels: {font, color: '#7a7060', boxWidth: 20, padding: 10}},
          tooltip: {callbacks: {label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%`}},
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: {color: gridColor},
            ticks: {callback: (v: number | string) => v + '%', font: mono, color: tickColor},
            title: {display: true, text: 'Resolved (%)', font, color: '#7a7060'},
          },
          x: {grid: {display: false}, ticks: {font, color: tickColor}},
        },
      },
    })
  }

  // Profile bar chart
  const prof = document.getElementById('profileChart') as any
  if (prof && !prof._chartjs) {
    new Chart(prof, {
      type: 'bar',
      data: {
        labels: ['Strong', 'Multiple winners', 'Weak', 'No differential'],
        datasets: [
          {
            label: 'Resolved by 32 sessions',
            data: [94.3, 93.1, 64.1, 57.3],
            backgroundColor: [COLORS.strong, COLORS.multi, COLORS.weak, COLORS.null],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {display: false},
          tooltip: {callbacks: {label: (ctx: any) => `${ctx.parsed.y}% resolved`}},
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: {color: gridColor},
            ticks: {callback: (v: number) => v + '%', font: mono, color: tickColor},
          },
          x: {grid: {display: false}, ticks: {font, color: '#7a7060'}},
        },
      },
    })
  }

  // Effect chart
  const eff = document.getElementById('effectChart') as any
  if (eff && !eff._chartjs) {
    // Correct order: index 0 = Calming, 1 = Child-Led, 2 = Stimulating
    const ESTIMATES = [0.97, 0.88, 0.4]
    const CI_LOWER = [0.25, -0.1, -0.04]
    const CI_UPPER = [1.59, 1.7, 0.82]
    const BAR_COLORS = [COLORS.multi, COLORS.null, COLORS.strong]
    const EXCLUDES_ZERO = CI_LOWER.map((lo, i) => lo > 0 || CI_UPPER[i] < 0)

    // Custom plugin: draws a diamond at the point estimate for each bar
    const diamondPlugin = {
      id: 'estimateDiamonds',
      afterDatasetsDraw(chart: any) {
        const {ctx, scales} = chart
        const meta = chart.getDatasetMeta(0) // CI dataset drives bar positions
        ESTIMATES.forEach((est, i) => {
          const bar = meta.data[i]
          if (!bar) return
          const x = scales.x.getPixelForValue(est)
          const cy = bar.y
          const half = Math.min(bar.height * 0.45, 9)

          ctx.save()
          ctx.fillStyle = BAR_COLORS[i]
          ctx.strokeStyle = '#fffef9'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x, cy - half) // top
          ctx.lineTo(x + half, cy) // right
          ctx.lineTo(x, cy + half) // bottom
          ctx.lineTo(x - half, cy) // left
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.restore()

          if (EXCLUDES_ZERO[i]) {
            const labelX = scales.x.getPixelForValue(CI_LOWER[i]) + 10
            const labelY = scales.y.getPixelForValue(CI_LOWER[i]) - 30
            ctx.save()
            ctx.font = `500 11px 'DM Sans', sans-serif`
            ctx.fillStyle = BAR_COLORS[i]
            ctx.textBaseline = 'middle'
            ctx.fillText('★ excludes zero', labelX, labelY)
            ctx.restore()
          }
        })
      },
    }

    new Chart(eff, {
      type: 'bar',
      plugins: [diamondPlugin],
      data: {
        labels: ['Calming', 'Child-Led', 'Stimulating'],
        datasets: [
          {
            // Floating bars encode [lower CI, upper CI]
            label: '95% Credible Interval',
            data: CI_LOWER.map((lo, i) => [lo, CI_UPPER[i]]),
            backgroundColor: BAR_COLORS.map((c, i) => c + (EXCLUDES_ZERO[i] ? '55' : '1a')),
            borderColor: BAR_COLORS.map((c, i) => c + (EXCLUDES_ZERO[i] ? 'ff' : '55')),
            borderWidth: BAR_COLORS.map((_, i) => (EXCLUDES_ZERO[i] ? 2 : 1)),
            borderRadius: 4,
            borderSkipped: false,
            barPercentage: 0.45,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {display: false},
          tooltip: {
            callbacks: {
              title: (ctx: any) => ctx[0].label,
              label: (ctx: any) => {
                const i = ctx.dataIndex
                const est = ESTIMATES[i]
                const lo = CI_LOWER[i]
                const hi = CI_UPPER[i]
                return [
                  `  Estimate:  +${est.toFixed(2)} pts`,
                  `  95% CrI:   [${lo.toFixed(2)}, ${hi.toFixed(2)}]`,
                ]
              },
            },
          },
        },
        scales: {
          x: {
            grid: {color: gridColor},
            ticks: {font: mono, color: tickColor},
            title: {
              display: true,
              text: 'Engagement pts above No Preparation',
              font,
              color: '#7a7060',
            },
          },
          y: {
            grid: {display: false},
            ticks: {font, color: '#7a7060'},
          },
        },
      },
    })
  }
}

// ── SMALL COMPONENTS ──────────────────────────────────────────
function SectionHeader({
  label,
  title,
  body,
  light,
}: {
  label: string
  title: string
  body?: string
  light?: boolean
}) {
  const muted = light ? 'rgba(250,246,240,0.7)' : '#7a7060'
  const titleColor = light ? '#fffef9' : '#1e1a14'
  const labelColor = light ? '#c49a72' : '#c49a72'
  return (
    <div>
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: '0.75rem',
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          color: titleColor,
          marginBottom: '1.25rem',
        }}
      >
        {title}
      </h2>
      {body && (
        <p style={{fontSize: '1rem', lineHeight: 1.8, color: muted, maxWidth: 680}}>{body}</p>
      )}
    </div>
  )
}

function FaqItem({q, a}: {q: string; a: string}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{borderBottom: '1px solid #e8dece', padding: '1.5rem 0'}}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#1e1a14',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {q}
        <span
          style={{
            fontSize: '1.4rem',
            color: '#c49a72',
            flexShrink: 0,
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </div>
      <div
        style={{
          fontSize: '0.92rem',
          lineHeight: 1.75,
          color: '#7a7060',
          maxHeight: open ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, padding-top 0.2s',
          paddingTop: open ? '1rem' : 0,
        }}
      >
        {a}
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function StudyPage() {
  const revealRefs = useRef<(HTMLElement | null)[]>([])
  const chartsInitialized = useRef(false)

  // Fonts
  useEffect(() => {
    if (!document.getElementById('study-fonts')) {
      const link = document.createElement('link')
      link.id = 'study-fonts'
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  // Chart.js
  useEffect(() => {
    if (chartsInitialized.current) return
    const load = () => {
      if (window.Chart) {
        initCharts(window.Chart)
        chartsInitialized.current = true
      }
    }
    if (window.Chart) {
      load()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
    script.onload = () => {
      setTimeout(load, 80)
    }
    document.head.appendChild(script)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const target = e.target as HTMLElement
            target.style.opacity = '1'
            target.style.transform = 'none'
          }
        }),
      {threshold: 0.1},
    )
    revealRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const reveal = (i: number) => ({
    ref: (el: HTMLElement | null) => {
      revealRefs.current[i] = el
    },
    style: {
      opacity: 0,
      transform: 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
  })

  // Stable ref-setter: each call site gets a fixed index baked in at module parse time
  // We use a closure counter that runs once per render — safe because JSX order is fixed.
  let _ri = 0
  const R = () => reveal(_ri++)

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#faf6f0',
        color: '#1e1a14',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes scrollLine { 0%,100% { width:40px } 50% { width:64px } }
        .study-why-card { background:#fffef9; border:1px solid #e8dece; border-radius:16px; padding:2rem; transition:transform 0.2s, box-shadow 0.2s; }
        .study-why-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(30,26,20,0.08); }
        .study-condition-card { border-radius:16px; padding:2rem 1.75rem; position:relative; overflow:hidden; transition:transform 0.2s; }
        .study-condition-card:hover { transform:translateY(-4px); }
        .study-condition-card.a { background:rgba(196,112,110,0.18); border:1px solid rgba(196,112,110,0.3); }
        .study-condition-card.b { background:rgba(74,143,168,0.18); border:1px solid rgba(74,143,168,0.3); }
        .study-condition-card.c { background:rgba(139,127,184,0.18); border:1px solid rgba(139,127,184,0.3); }
        .study-condition-card.d { background:rgba(196,154,114,0.12); border:1px solid rgba(196,154,114,0.25); }
        .study-condition-card.a .cb { background:rgba(196,112,110,0.3); color:#e8a09e; }
        .study-condition-card.b .cb { background:rgba(74,143,168,0.3); color:#8fcce0; }
        .study-condition-card.c .cb { background:rgba(139,127,184,0.3); color:#c4bbf0; }
        .study-condition-card.d .cb { background:rgba(196,154,114,0.25); color:#d4b990; }
        .study-faq-item { border-bottom:1px solid #e8dece; padding:1.5rem 0; }
        .study-safety-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:1.75rem; }
        .study-profile-card { background:#fffef9; border:1px solid #e8dece; border-radius:16px; padding:1.75rem; display:flex; flex-direction:column; gap:0.5rem; }
        .study-chart-card { background:#faf6f0; border:1px solid #e8dece; border-radius:16px; padding:1.75rem; }
        .stop-sup { background:rgba(184,92,56,0.12); color:#b85c38; }
        .stop-aipe { background:rgba(74,143,168,0.12); color:#4a8fa8; }
        .stop-rope { background:rgba(139,127,184,0.12); color:#8b7fb8; }
      `}</style>

      {/* ── STICKY NAV ──────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(250,246,240,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e8dece',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1rem',
            fontWeight: 700,
            color: '#3d5a45',
          }}
        >
          Maya Care and Grow · Study
        </span>
        <div style={{display: 'flex', gap: '2rem'}}>
          {[
            '#why',
            '#conditions',
            '#how',
            '#safety',
            '#simulations',
            '#results',
            '#resources',
            '#faq',
          ].map((href, i) => (
            <a
              key={i}
              href={href}
              onClick={(e) => {
                e.preventDefault()
                const element = document.querySelector(href)
                if (element) {
                  element.scrollIntoView({behavior: 'smooth', block: 'start'})
                }
              }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#7a7060',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className={'hover:font-bold'}
            >
              {
                [
                  'Why',
                  'Conditions',
                  'How it Works',
                  'Safety',
                  'Simulations',
                  'Results',
                  'Resources',
                  'FAQ',
                ][i]
              }
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 2rem 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(107,143,113,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(196,154,114,0.15) 0%, transparent 60%)',
          }}
        />
        <Row className={'gap-8 mx-auto'}>
          <div style={{maxWidth: 800, position: 'relative', zIndex: 1}}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                lineHeight: 1.1,
                fontWeight: 700,
                color: '#1e1a14',
                marginBottom: '1.5rem',
                animation: 'fadeUp 0.6s 0.1s ease both',
              }}
            >
              Every child learns
              <br />
              <em style={{fontStyle: 'italic', color: '#b85c38'}}>differently</em>.<br />
              So should their
              <br />
              preparation.
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.75,
                color: '#7a7060',
                maxWidth: 620,
                animation: 'fadeUp 0.6s 0.2s ease both',
              }}
            >
              We're studying how a short 10-minute warm-up before a learning session can help
              children with autism engage more — and finding the right warm-up{' '}
              <em>for each individual child</em>.
            </p>
            {/*<div style={{ marginTop: "4rem", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#bab2a0", animation: "fadeUp 0.6s 0.4s ease both" }}>*/}
            {/*  <div style={{ width: 40, height: 1, background: "#bab2a0", animation: "scrollLine 2s ease infinite" }} />*/}
            {/*  Scroll to explore*/}
            {/*</div>*/}
          </div>
          <Col className={'gap-6'}>
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '3rem',
                flexWrap: 'wrap',
                animation: 'fadeUp 0.6s 0.3s ease both',
              }}
            >
              {[
                [
                  'Setting',
                  <CustomLink href="https://mayacaregrow.wordpress.com" className={'hero-link'}>
                    Maya Care and Grow
                  </CustomLink>,
                ],
                [
                  'Lead Researcher',
                  <CustomLink href="https://martinbraquet.com" className={'hero-link'}>
                    Martin Braquet
                  </CustomLink>,
                ],
                [
                  'Collaborator',
                  <CustomLink
                    href="https://mayacaregrow.wordpress.com/about/"
                    className={'hero-link'}
                  >
                    Riki Dewan
                  </CustomLink>,
                ],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}
                >
                  <span style={{fontSize: '0.7rem', color: '#bab2a0', textTransform: 'uppercase'}}>
                    {label}
                  </span>
                  <span style={{fontSize: '0.95rem', fontWeight: 500, color: '#1e1a14'}}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/*<span*/}
            {/*  style={{*/}
            {/*    display: 'inline-block',*/}
            {/*    background: '#3d5a45',*/}
            {/*    color: '#faf6f0',*/}
            {/*    fontSize: '0.7rem',*/}
            {/*    fontWeight: 500,*/}
            {/*    letterSpacing: '0.12em',*/}
            {/*    textTransform: 'uppercase',*/}
            {/*    padding: '0.4rem 1rem',*/}
            {/*    borderRadius: 100,*/}
            {/*    marginTop: '2rem',*/}
            {/*    marginBottom: '2rem',*/}
            {/*    animation: 'fadeUp 0.6s ease both',*/}
            {/*  }}*/}
            {/*>*/}
            {/*  Research Study · Agartala, India*/}
            {/*</span>*/}
            <Image
              src={
                'https://mayacaregrow.wordpress.com/wp-content/uploads/2026/04/peer-learning-riki.jpeg'
              }
              width={600}
              height={600}
              alt={'Maya Care Grow'}
              style={{height: '450px', objectFit: 'cover'}}
              className={'rounded-2xl'}
            />
          </Col>
        </Row>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── CLINICAL CONTEXT ─────────────────────────── */}
      <section id="context" style={{padding: '90px 2rem', background: '#fff'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="The Setting"
              title="Clinical Context: Maya Care and Grow"
              body="In Agartala, India, early autism intervention requires a highly individualized approach. Our study is integrated directly into the daily routines of a center serving 25 children with diverse developmental profiles."
            />
          </div>

          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              marginTop: '3rem',
              alignItems: 'center',
            }}
          >
            <div style={{fontSize: '1rem', color: '#4a453e', lineHeight: 1.7}}>
              <p style={{marginBottom: '1.5rem'}}>
                Children aged <strong>3 to 14</strong> attend 2–16 hours of therapy per week. In
                this setting, the first 15 minutes are critical; practitioners currently use a
                variety of activities to 'prepare' a child for learning.
              </p>
              <p>
                While these preparations—ranging from{' '}
                <strong>massage and bubbles to puzzles and music</strong>—are delivered with expert
                judgment, there is currently no data-driven way to know which specific activity
                maximizes engagement for a specific child.
              </p>
            </div>

            <div
              style={{
                background: '#faf6f0',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e8dece',
              }}
            >
              <h4
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.1rem',
                  marginBottom: '1rem',
                  color: '#1e1a14',
                }}
              >
                The Opportunity
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {[
                  {icon: '📍', text: 'Real-world setting with routine delivery'},
                  {icon: '📊', text: 'Feasible data collection via practitioner involvement'},
                  {icon: '🔄', text: 'Repeated-measures design for highly variable responses'},
                  {icon: '🎯', text: 'Personalized results for every enrolled child'},
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#7a7060'}}
                  >
                    <span>{item.icon}</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            {...R()}
            style={{
              marginTop: '3rem',
              textAlign: 'center',
              borderTop: '1px solid #f0e6d6',
              paddingTop: '2rem',
            }}
          >
            <p style={{fontSize: '0.9rem', color: '#bab2a0', fontStyle: 'italic'}}>
              "Every child responds differently. Our goal is to replace intuition with evidence."
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY ─────────────────────────────────────────── */}
      <section id="why" style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="The Challenge"
              title="Why does preparation matter?"
              body="Children with autism often experience challenges regulating their sensory systems before a learning session. A child who arrives overwhelmed, under-stimulated, or dysregulated may struggle to engage — not because of the content, but because of how they feel. A brief, targeted warm-up can help bridge that gap. But the right warm-up isn't the same for everyone."
            />
          </div>

          <div
            {...R()}
            style={{
              display: 'flex',
              gap: '3rem',
              flexWrap: 'wrap',
              marginTop: '3rem',
              padding: '2rem',
              background: '#fffef9',
              border: '1px solid #e8dece',
              borderRadius: 16,
            }}
          >
            {[
              ['4', 'preparation conditions tested'],
              // ['≥12', 'sessions before first analysis'],
              ['87%', 'expected resolution rate by 32 sessions'],
              ['8 weeks', 'max data collection window per child'],
            ].map(([num, desc]) => (
              <div
                key={desc}
                style={{display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '250px'}}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    color: '#3d5a45',
                    lineHeight: 1,
                  }}
                >
                  {num}
                </span>
                <span style={{fontSize: '0.82rem', color: '#7a7060'}}>{desc}</span>
              </div>
            ))}
          </div>

          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}
          >
            {[
              [
                '🧒',
                'Individualized by design',
                "Each child serves as their own control. We compare all four conditions within the same child across sessions, so results aren't muddied by differences between children.",
              ],
              [
                '📊',
                'Bayesian learning',
                `Our statistical approach gives probabilities, not just yes/no answers. We can say "there's an 85% chance Condition A is best for this child" — and stop as soon as we're confident enough`,
              ],
              [
                '🛑',
                'Adaptive & humane',
                'We stop testing a child the moment we have a clear answer, or if any condition consistently distresses them. No child is kept in an ineffective routine for longer than necessary.',
              ],
            ].map(([icon, title, body]) => (
              <div key={title} className="study-why-card">
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>{icon}</div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: '#1e1a14',
                    marginBottom: '0.5rem',
                  }}
                >
                  {title}
                </h3>
                <p style={{fontSize: '0.9rem', lineHeight: 1.7, color: '#7a7060'}}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── CONDITIONS ──────────────────────────────────── */}
      <section id="conditions" style={{padding: '90px 2rem', background: '#3d5a45'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              light
              label="The Interventions"
              title="Four preparation conditions"
              body="Each child is assigned one fixed activity per condition before the study starts. The 20-minute learning session that follows is identical each time — so any difference in engagement can only be due to the warm-up."
            />
          </div>
          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginTop: '3rem',
            }}
          >
            {CONDITIONS.map((c) => (
              <div key={c.key} className={`study-condition-card ${c.key}`}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    opacity: 0.18,
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '1rem',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {c.key}
                </span>
                <span
                  className="cb"
                  style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.3rem 0.7rem',
                    borderRadius: 100,
                    marginBottom: '1rem',
                  }}
                >
                  {c.badge}
                </span>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#fffef9',
                    marginBottom: '0.5rem',
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.75rem',
                    color: '#bab2a0',
                    marginBottom: '0.75rem',
                  }}
                >
                  {c.activity}
                </p>
                <p style={{fontSize: '0.88rem', lineHeight: 1.65, color: 'rgba(250,246,240,0.65)'}}>
                  {c.desc}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#bab2a0',
                  }}
                >
                  ⏱ {c.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how" style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Process"
              title="How does a session work?"
              body="A typical session takes about 30 minutes. The order of conditions across sessions is randomized — a bit like shuffling cards — so no child gets the same warm-up two sessions in a row."
            />
          </div>
          <div {...R()} style={{...R().style, marginTop: '3rem'}}>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                style={{
                  display: 'flex',
                  gap: '2rem',
                  marginBottom: i < STEPS.length - 1 ? '3rem' : 0,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#3d5a45',
                    color: '#faf6f0',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {s.n}
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -48,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 1,
                        height: 48,
                        background: 'linear-gradient(to bottom, #3d5a45, #e8dece)',
                      }}
                    />
                  )}
                </div>
                <div style={{flex: 1, paddingTop: '0.5rem'}}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: '#1e1a14',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{fontSize: '0.92rem', lineHeight: 1.75, color: '#7a7060'}}>{s.body}</p>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: '#e8dece',
                      color: '#7a7060',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 100,
                      marginTop: '0.5rem',
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── ENGAGEMENT SCALE ─────────────────────────────── */}
      <section style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Measurement"
              title="What does the engagement score mean?"
              body="The BRES-10 (Blinded Rater Engagement Scale) is a 1–10 scale scored by a trained observer who does not know which warm-up condition was assigned. Higher scores mean more independent, sustained engagement."
            />
          </div>
          <div
            {...R()}
            style={{
              ...R().style,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              marginTop: '2rem',
            }}
          >
            {SCALE_ROWS.map((row) => (
              <div
                key={row.range}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3.5rem 1fr',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#7a7060',
                    textAlign: 'right',
                  }}
                >
                  {row.range}
                </span>
                <div
                  style={{height: 36, background: '#e8dece', borderRadius: 8, overflow: 'hidden'}}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${row.pct}%`,
                      background: row.color,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: 'white',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.label} — {row.sub}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY ──────────────────────────────────────── */}
      <section id="safety" style={{padding: '90px 2rem', background: '#3d5a45'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              light
              label="Your Child's Wellbeing"
              title="Safety comes first"
              body="This study uses only activities already practiced at Maya Care and Grow. Every safeguard below is active from the first session."
            />
          </div>
          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginTop: '3rem',
            }}
          >
            {SAFETY_ITEMS.map((item) => (
              <div key={item.title} className="study-safety-card">
                <div style={{fontSize: '1.75rem', marginBottom: '0.75rem'}}>{item.icon}</div>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#fffef9',
                    marginBottom: '0.4rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(250,246,240,0.6)'}}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── PROFILES ────────────────────────────────────── */}
      <section id={'simulations'} style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Child Archetypes"
              title="What response patterns do we expect?"
              body="Based on clinical knowledge of this setting, we anticipate children will fall into four profiles. The study is designed to detect meaningful differences for each type."
            />
          </div>
          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginTop: '3rem',
            }}
          >
            {PROFILES.map((p) => (
              <div key={p.title} className="study-profile-card">
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: {strong: '#b85c38', multi: '#4a8fa8', weak: '#d4874e', null: '#8b7fb8'}[
                      p.cls
                    ],
                  }}
                >
                  {p.pct}
                </span>
                <span style={{fontSize: '0.95rem', fontWeight: 500, color: '#1e1a14'}}>
                  {p.title}
                </span>
                <p style={{fontSize: '0.85rem', lineHeight: 1.65, color: '#7a7060'}}>{p.desc}</p>
                <span
                  className={`stop-${p.stopCls}`}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 100,
                    alignSelf: 'flex-start',
                  }}
                >
                  {p.stop}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── CHARTS ──────────────────────────────────────── */}
      <section style={{padding: '90px 2rem', background: '#fffef9'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Simulated Power Analysis"
              title="How confident will we be, and when?"
              body="Before collecting any data, we ran computer simulations to confirm the study can deliver reliable answers. These charts show how resolution rates grow with more sessions — and how they differ by child type."
            />
          </div>
          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}
          >
            <div className="study-chart-card">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#1e1a14',
                  marginBottom: '0.3rem',
                }}
              >
                Resolution Rate by Sessions
              </h3>
              <p style={{fontSize: '0.8rem', color: '#bab2a0', marginBottom: '1.5rem'}}>
                Proportion of simulated children with a confirmed recommendation
              </p>
              <div style={{position: 'relative'}}>
                <PowerCurve />
              </div>
            </div>
          </div>
          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}
          >
            <div className="study-chart-card">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#1e1a14',
                  marginBottom: '0.3rem',
                }}
              >
                Resolution by Child Profile at 32 Sessions
              </h3>
              <p style={{fontSize: '0.8rem', color: '#bab2a0', marginBottom: '1.5rem'}}>
                Performance varies by how distinct the best preparation is
              </p>
              <div style={{position: 'relative', height: 220}}>
                <canvas id="profileChart" />
              </div>
            </div>
            <div {...R()} className="study-chart-card">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#1e1a14',
                  marginBottom: '0.3rem',
                }}
              >
                Illustrative Group-Level Results
              </h3>
              <p style={{fontSize: '0.8rem', color: '#bab2a0', marginBottom: '1.5rem'}}>
                Simulated model output (900 observations, 25 children) — estimated benefit of each
                condition vs. No Preparation
              </p>
              <div style={{position: 'relative', height: 220}}>
                <canvas id="effectChart" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      {/* ── SENSITIVITY ANALYSES ─────────────────────────── */}
      <section id="sensitivity" style={{padding: '90px 2rem', background: '#faf6f0'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Methodological Rigor"
              title="Stability & Sensitivity"
              body="We performed 'stress-tests' on our statistical models to ensure clinical recommendations are driven by the child's actual progress, not by background noise or mathematical assumptions."
            />
          </div>

          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}
          >
            {/* Covariate Sensitivity Card */}
            <div className="study-chart-card" style={{background: '#fffef9'}}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1e1a14',
                  marginBottom: '1rem',
                }}
              >
                🌪️ Environmental Robustness
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#7a7060',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                We tested the model by removing information about the <strong>child's age</strong>{' '}
                and the <strong>specific teacher</strong>.
              </p>
              <div
                style={{
                  background: 'rgba(61, 90, 69, 0.05)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(61, 90, 69, 0.1)',
                }}
              >
                <div
                  style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                >
                  <span style={{fontSize: '0.85rem', fontWeight: 500, color: '#3d5a45'}}>
                    Model Agreement
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 700,
                      color: '#3d5a45',
                      fontSize: '1.1rem',
                    }}
                  >
                    100%
                  </span>
                </div>
                <div
                  style={{
                    height: '4px',
                    background: '#e8dece',
                    borderRadius: '2px',
                    marginTop: '0.5rem',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{width: '100%', height: '100%', background: '#3d5a45'}} />
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#bab2a0',
                    marginTop: '0.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  Result: Clinical recommendations remain identical even when ignoring environmental
                  covariates.
                </p>
              </div>
            </div>

            {/* Prior Sensitivity Card */}
            <div className="study-chart-card" style={{background: '#fffef9'}}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1e1a14',
                  marginBottom: '1rem',
                }}
              >
                ⚖️ Decision Stability
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#7a7060',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                We re-ran the study using other mathematical assumptions (Bayesian priors) to see if
                the outcome changed.
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {[
                  {label: 'Decision Agreement', val: '87.3%', target: '>85%', pass: true},
                  {label: 'Skeptical Priors', val: '+0.01 sessions', target: '<4', pass: true},
                  {label: 'Vague Bias', val: '-0.03 sessions', target: 'Minimal', pass: true},
                  {
                    label: 'Low Heterogeneity',
                    val: '+0.47 sessions',
                    target: 'Minimal',
                    pass: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0',
                      borderBottom: '1px solid #f0e6d6',
                    }}
                  >
                    <span style={{color: '#7a7060'}}>{item.label}</span>
                    <span style={{fontWeight: 600, color: '#1e1a14'}}>
                      {item.val} <span style={{color: '#22c55e', marginLeft: '4px'}}>✓</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualitative Safety Net */}
          <div
            {...R()}
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              background: 'rgba(184, 92, 56, 0.05)',
              border: '1px dashed rgba(184, 92, 56, 0.3)',
              borderRadius: '12px',
            }}
          >
            <p
              style={{fontSize: '0.85rem', color: '#b85c38', lineHeight: 1.6, textAlign: 'center'}}
            >
              <strong>The Qualitative Safety Net:</strong> In cases where a recommendation is
              mathematically "fragile" (sensitive to assumptions), the Principal Investigator and
              Lead Practitioner conduct a manual review of session notes before finalizing the
              clinical assignment.
            </p>
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      <section id="results" style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Results"
              title="Predictive Power & Personalized Insights"
              body="Data collection is in progress — we'll update this section in June."
            />
          </div>
        </div>
      </section>

      <div style={{height: 1, background: '#e8dece', margin: '0 2rem'}} />

      <section
        id="resources"
        style={{padding: '80px 2rem', background: '#fffef9', borderTop: '1px solid #e8dece'}}
      >
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader
              label="Open Science"
              title="Research & Transparency"
              body="We are committed to full transparency. Below you can find the source code, pre-registered protocols, and the technical reports that validate our statistical approach."
            />
          </div>

          <div
            {...R()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem',
            }}
          >
            {/* Primary Research Links */}
            <CustomLink
              href="https://github.com/MartinBraquet/rct-autism"
              className="hero-link"
              style={{
                padding: '1.5rem',
                background: '#faf6f0',
                borderRadius: '12px',
                display: 'block',
              }}
            >
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>💻</span>{' '}
              <strong>Source Code</strong>
              <p style={{fontSize: '0.8rem', color: '#7a7060', marginTop: '0.5rem'}}>
                View the Bayesian model and simulation scripts on GitHub.
              </p>
            </CustomLink>

            <CustomLink
              href="https://osf.io/cwzm3"
              className="hero-link"
              style={{
                padding: '1.5rem',
                background: '#faf6f0',
                borderRadius: '12px',
                display: 'block',
              }}
            >
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>📜</span>{' '}
              <strong>OSF Preregistration</strong>
              <p style={{fontSize: '0.8rem', color: '#7a7060', marginTop: '0.5rem'}}>
                View our timestamped study plan to ensure unbiased reporting.
              </p>
            </CustomLink>

            <CustomLink
              href={protocolUrl}
              className="hero-link"
              style={{
                padding: '1.5rem',
                background: '#faf6f0',
                borderRadius: '12px',
                display: 'block',
              }}
            >
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>📄</span>{' '}
              <strong>Study Protocol</strong>
              <p style={{fontSize: '0.8rem', color: '#7a7060', marginTop: '0.5rem'}}>
                Download the full PDF describing the clinical workflow.
              </p>
            </CustomLink>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section id="faq" style={{padding: '90px 2rem'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <div {...R()}>
            <SectionHeader label="Questions & Answers" title="Frequently asked questions" />
          </div>
          <div {...R()} style={{...R().style, marginTop: '3rem'}}>
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer
        style={{
          background: '#1e1a14',
          color: 'rgba(250,246,240,0.5)',
          padding: '3rem 2rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          lineHeight: 1.7,
        }}
      >
        <p style={{color: 'rgba(250,246,240,0.85)', fontWeight: 500}}>
          Personalized Pre-Session Preparation to Improve Engagement in Early Autism Intervention
        </p>
        <p style={{marginTop: '0.5rem'}}>
          Principal Investigator: Martin Braquet · Collaborator: Riki Dewan (Founder, Maya Care and
          Grow) · Agartala, India
        </p>
        {/*<p style={{marginTop: '0.5rem'}} className={'custom-link'}>*/}
        {/*  Full source code (protocol, simulation, analysis, paper, webpage):{' '}*/}
        {/*  <CustomLink href="https://github.com/MartinBraquet/rct-autism">*/}
        {/*    github.com/MartinBraquet/rct-autism*/}
        {/*  </CustomLink>*/}
        {/*</p>*/}
        <p style={{marginTop: '1rem', fontSize: '0.75rem'}}>
          Conducted in accordance with the Declaration of Helsinki. All activities are standard
          components of existing learning at Maya Care and Grow.
        </p>
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            fontSize: '0.8rem',
          }}
          className={'custom-link'}
        >
          <CustomLink href="https://github.com/MartinBraquet/rct-autism">GitHub</CustomLink>
          <CustomLink href="https://osf.io/cwzm3">OSF Registry</CustomLink>
          <CustomLink href={protocolUrl}>Protocol PDF</CustomLink>
        </div>
      </footer>
    </div>
  )
}