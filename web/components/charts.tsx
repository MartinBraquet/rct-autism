import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

export const PowerCurve = () => {
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
export function initCharts(Chart: any) {
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