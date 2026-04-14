import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ── Color tokens ──────────────────────────────────────────────────────────────
const VEL = '#2dd4bf'
const CRIZ = '#fb923c'
const IND = '#818cf8'
const AMB = '#fbbf24'
const MUT = '#64748b'
const GRD = 'rgba(100,116,139,0.14)'
const TIP = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 6,
  fontSize: 11,
  color: '#cbd5e1',
}

// ── Deterministic PRNG ────────────────────────────────────────────────────────
function prng(s: number) {
  const x = Math.sin(s + 1) * 10000
  return x - Math.floor(x)
}

// ── KM PFS Data ───────────────────────────────────────────────────────────────
const kmData = [
  {mo: 0, vel: 100.0, vLo: 100.0, vHi: 100.0, criz: 100.0, cLo: 100.0, cHi: 100.0},
  {mo: 3, vel: 95.2, vLo: 92.1, vHi: 97.3, criz: 84.7, cLo: 79.8, cHi: 88.5},
  {mo: 6, vel: 88.4, vLo: 83.9, vHi: 92.1, criz: 69.3, cLo: 63.1, cHi: 74.8},
  {mo: 9, vel: 82.1, vLo: 76.8, vHi: 86.6, criz: 55.1, cLo: 48.4, cHi: 61.5},
  {mo: 12, vel: 76.3, vLo: 70.2, vHi: 81.5, criz: 41.8, cLo: 35.2, cHi: 48.3},
  {mo: 15, vel: 69.4, vLo: 62.9, vHi: 75.2, criz: 31.6, cLo: 25.3, cHi: 38.3},
  {mo: 18, vel: 63.1, vLo: 56.3, vHi: 69.3, criz: 23.5, cLo: 17.9, cHi: 29.8},
  {mo: 21, vel: 56.8, vLo: 49.7, vHi: 63.4, criz: 17.1, cLo: 12.3, cHi: 23.1},
  {mo: 24, vel: 50.9, vLo: 43.6, vHi: 57.9, criz: 11.8, cLo: 7.7, cHi: 17.2},
  {mo: 27, vel: 44.7, vLo: 37.3, vHi: 51.9, criz: 7.9, cLo: 4.7, cHi: 12.9},
  {mo: 30, vel: 38.2, vLo: 30.8, vHi: 45.5, criz: 5.1, cLo: 2.7, cHi: 9.3},
  {mo: 33, vel: 31.1, vLo: 24.0, vHi: 38.5, criz: 3.2, cLo: 1.3, cHi: 7.4},
  {mo: 36, vel: 25.3, vLo: 18.6, vHi: 32.8, criz: 1.9, cLo: 0.5, cHi: 6.6},
].map((d) => ({
  ...d,
  vBand: +(d.vHi - d.vLo).toFixed(2),
  cBand: +(d.cHi - d.cLo).toFixed(2),
}))

// ── Forest Plot ───────────────────────────────────────────────────────────────
const forestRaw = [
  {sg: 'Overall', n: 343, hr: 0.42, lo: 0.31, hi: 0.57, p: '<0.0001'},
  {sg: 'Age <65', n: 218, hr: 0.39, lo: 0.27, hi: 0.56, p: '<0.0001'},
  {sg: 'Age ≥65', n: 125, hr: 0.47, lo: 0.29, hi: 0.77, p: '0.003'},
  {sg: 'ECOG PS 0', n: 179, hr: 0.38, lo: 0.25, hi: 0.57, p: '<0.0001'},
  {sg: 'ECOG PS 1–2', n: 164, hr: 0.46, lo: 0.3, hi: 0.69, p: '0.0002'},
  {sg: 'Brain mets', n: 112, hr: 0.35, lo: 0.21, hi: 0.58, p: '<0.0001'},
  {sg: 'No brain mets', n: 231, hr: 0.47, lo: 0.32, hi: 0.68, p: '<0.0001'},
  {sg: 'EML4-ALK v1', n: 158, hr: 0.4, lo: 0.26, hi: 0.62, p: '<0.0001'},
  {sg: 'ALK variant 2+', n: 185, hr: 0.44, lo: 0.29, hi: 0.65, p: '<0.0001'},
  {sg: 'PD-L1 <1%', n: 141, hr: 0.44, lo: 0.28, hi: 0.69, p: '0.0003'},
  {sg: 'PD-L1 ≥1%', n: 202, hr: 0.41, lo: 0.28, hi: 0.6, p: '<0.0001'},
  {sg: '1L setting', n: 197, hr: 0.43, lo: 0.29, hi: 0.64, p: '<0.0001'},
  {sg: '2L+ setting', n: 146, hr: 0.41, lo: 0.26, hi: 0.64, p: '<0.0001'},
]
const forestData = forestRaw.map((d, i) => ({
  ...d,
  y: i,
  errX: [+(d.hr - d.lo).toFixed(3), +(d.hi - d.hr).toFixed(3)],
}))

// ── Biomarker Scatter ─────────────────────────────────────────────────────────
const velBio = Array.from({length: 70}, (_, i) => {
  const cnv = +(1.5 + prng(i) * 8.5).toFixed(2)
  const pfs = Math.max(0.5, +(5 + cnv * 2.3 + (prng(i + 1000) - 0.5) * 10).toFixed(1))
  return {cnv, pfs}
})
const crizBio = Array.from({length: 70}, (_, i) => {
  const cnv = +(1.5 + prng(i + 200) * 8.5).toFixed(2)
  const pfs = Math.max(0.5, +(1.5 + cnv * 1.1 + (prng(i + 1200) - 0.5) * 7).toFixed(1))
  return {cnv, pfs}
})

// ── Dose-Response (Phase Ib) ──────────────────────────────────────────────────
const doseData = [
  {dose: 75, orr: 42.1, orrLo: 31.2, orrBand: 22.4, pfs: 11.2},
  {dose: 150, orr: 61.3, orrLo: 51.8, orrBand: 18.4, pfs: 17.8},
  {dose: 225, orr: 74.2, orrLo: 65.3, orrBand: 16.5, pfs: 23.6},
  {dose: 300, orr: 78.9, orrLo: 70.4, orrBand: 15.6, pfs: 25.1},
  {dose: 375, orr: 79.4, orrLo: 71.0, orrBand: 15.3, pfs: 24.9},
]

// ── Grade ≥3 AEs ──────────────────────────────────────────────────────────────
const aeData = [
  {ae: 'ALT↑', vel: 8.2, criz: 3.1},
  {ae: 'AST↑', vel: 5.7, criz: 2.4},
  {ae: 'Nausea', vel: 3.1, criz: 6.8},
  {ae: 'Fatigue', vel: 4.2, criz: 7.1},
  {ae: 'Vision', vel: 1.8, criz: 9.3},
  {ae: 'Edema', vel: 0.9, criz: 5.4},
  {ae: 'QTc↑', vel: 3.6, criz: 1.2},
  {ae: 'ILD', vel: 2.1, criz: 0.4},
]

// ── Custom shapes & tooltips ──────────────────────────────────────────────────
const Diamond = ({cx, cy}: {cx: number; cy: number}) => (
  <polygon points={`${cx},${cy - 5} ${cx + 7},${cy} ${cx},${cy + 5} ${cx - 7},${cy}`} fill={IND} />
)

const KMTip = ({active, payload, label}: {
  active: boolean,
  payload: any,
  label: string,
}) => {
  if (!active || !payload?.length) return null
  const v = payload.find((p: any) => p.dataKey === 'vel')
  const c = payload.find((p: any) => p.dataKey === 'criz')
  return (
    <div style={{...TIP, padding: '8px 12px'}}>
      <p style={{color: '#94a3b8', marginBottom: 4, fontWeight: 500}}>Month {label}</p>
      {v && <p style={{color: VEL}}>Velarinib: {(+v.value).toFixed(1)}%</p>}
      {c && <p style={{color: CRIZ}}>Crizotinib: {(+c.value).toFixed(1)}%</p>}
    </div>
  )
}

const ForestTip = ({active, payload}: {active: boolean; payload: any}) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d?.sg) return null
  return (
    <div style={{...TIP, padding: '8px 12px', minWidth: 210}}>
      <p style={{color: '#e2e8f0', fontWeight: 600, marginBottom: 4}}>{d.sg}</p>
      <p style={{color: '#94a3b8'}}>n = {d.n}</p>
      <p style={{color: '#94a3b8'}}>
        HR {d.hr} (95% CI {d.lo}–{d.hi})
      </p>
      <p style={{color: d.p === '<0.0001' ? VEL : '#facc15'}}>p = {d.p}</p>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const Card = ({label, val, sub, col}: {label: string; val: string; sub: string; col: string}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
    <p className="text-xs text-slate-500 mb-2">{label}</p>
    <p className="text-2xl font-bold" style={{color: col}}>
      {val}
    </p>
    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sub}</p>
  </div>
)

// ── Main export ───────────────────────────────────────────────────────────────
export default function VELA301() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200 p-6"
      style={{fontFamily: "ui-monospace, SFMono-Regular, 'Cascadia Code', monospace"}}
    >
      {/* ── Trial header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 tracking-widest uppercase mb-1">
            Phase III · Open-label RCT · NCT04821847 · ITT population
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">VELA-301</h1>
          <p className="text-sm text-slate-400 mt-1">
            Velarinib 300 mg QD vs. Crizotinib 250 mg BID · ALK+ metastatic NSCLC · First-line
          </p>
          <p className="text-xs text-slate-500 mt-1">
            N = 343 · 1:1 randomization · Median follow-up 36.2 mo (IQR 28.1–42.4) · Data cutoff Jan
            2025
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end mt-1">
          <span
            className="text-xs px-3 py-1 rounded-md border font-medium"
            style={{background: '#042D2B', color: VEL, borderColor: '#0F4E4A'}}
          >
            Primary endpoint met · p&lt;0.0001
          </span>
          <span className="text-xs px-3 py-1 rounded-md border border-slate-700 text-slate-500">
            Stratified: brain mets · ECOG PS · EML4-ALK variant
          </span>
        </div>
      </div>

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card label="Median PFS · Velarinib" val="24.3 mo" sub="95% CI 20.8–28.1 mo" col={VEL} />
        <Card label="Median PFS · Crizotinib" val="10.7 mo" sub="95% CI 8.9–12.6 mo" col={CRIZ} />
        <Card
          label="Hazard Ratio (PFS)"
          val="0.42"
          sub="95% CI 0.31–0.57 · log-rank p<0.0001"
          col={IND}
        />
        <Card
          label="Confirmed ORR · Velarinib"
          val="78.9%"
          sub="CR 18.4% · PR 60.5% · DCR 92.3%"
          col={AMB}
        />
      </div>

      {/* ── Row 1: KM + Forest plot ── */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* KM Curve ─────────────────────────────────────────────────────── */}
        <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
            Primary endpoint · ITT
          </p>
          <p className="text-sm font-semibold text-white mb-0.5">
            Progression-Free Survival · Kaplan-Meier
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Stratified log-rank · Greenwood 95% CI shaded · BICR-assessed (RECIST v1.1)
          </p>

          <ResponsiveContainer width="100%" height={290}>
            <ComposedChart data={kmData} margin={{top: 10, right: 25, bottom: 32, left: 20}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRD} />
              <XAxis
                dataKey="mo"
                stroke={MUT}
                tick={{fontSize: 11, fill: '#94a3b8'}}
                label={{
                  value: 'Time (months)',
                  position: 'insideBottom',
                  offset: -18,
                  fill: MUT,
                  fontSize: 11,
                }}
              />
              <YAxis
                domain={[0, 100]}
                stroke={MUT}
                tick={{fontSize: 11, fill: '#94a3b8'}}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: 'PFS probability (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  fill: MUT,
                  fontSize: 11,
                }}
              />
              <Tooltip content={<KMTip active={false} payload={[]} label="" />} />

              {/* CI bands — stacked area trick: invisible spacer + visible band */}
              <Area
                stackId="v"
                type="stepAfter"
                dataKey="vLo"
                stroke="none"
                fillOpacity={0}
                legendType="none"
              />
              <Area
                stackId="v"
                type="stepAfter"
                dataKey="vBand"
                stroke="none"
                fill="rgba(45,212,191,0.18)"
                legendType="none"
              />
              <Area
                stackId="c"
                type="stepAfter"
                dataKey="cLo"
                stroke="none"
                fillOpacity={0}
                legendType="none"
              />
              <Area
                stackId="c"
                type="stepAfter"
                dataKey="cBand"
                stroke="none"
                fill="rgba(251,146,60,0.15)"
                legendType="none"
              />

              {/* Survival curves */}
              <Line
                type="stepAfter"
                dataKey="vel"
                stroke={VEL}
                strokeWidth={2.5}
                dot={false}
                legendType="none"
              />
              <Line
                type="stepAfter"
                dataKey="criz"
                stroke={CRIZ}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="8 4"
                legendType="none"
              />

              {/* Median vertical markers */}
              <ReferenceLine x={24.3} stroke={VEL} strokeDasharray="3 3" strokeOpacity={0.45} />
              <ReferenceLine x={10.7} stroke={CRIZ} strokeDasharray="3 3" strokeOpacity={0.45} />
              {/* 50% horizontal guide */}
              <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>

          {/* At-risk table */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-2">Number at risk</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '88px repeat(7, 1fr)',
                fontSize: '11px',
                rowGap: '4px',
              }}
            >
              <span className="text-slate-600">Month</span>
              {[0, 6, 12, 18, 24, 30, 36].map((m) => (
                <span key={m} className="text-center text-slate-500">
                  {m}
                </span>
              ))}
              <span style={{color: VEL}}>Velarinib</span>
              {[172, 158, 132, 107, 86, 59, 38].map((n, i) => (
                <span key={i} className="text-center text-slate-300">
                  {n}
                </span>
              ))}
              <span style={{color: CRIZ}}>Crizotinib</span>
              {[171, 138, 95, 55, 28, 13, 5].map((n, i) => (
                <span key={i} className="text-center text-slate-300">
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Legend row */}
          <div className="flex items-center gap-8 mt-3 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span style={{width: 28, height: 2, background: VEL, display: 'inline-block'}} />
              Velarinib 300 mg QD (n=172)
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span
                style={{
                  width: 28,
                  height: 2,
                  background: CRIZ,
                  display: 'inline-block',
                  opacity: 0.8,
                }}
              />
              Crizotinib 250 mg BID (n=171)
            </span>
            <span className="ml-auto text-xs">
              <span className="text-slate-500">HR 0.42 (0.31–0.57) · </span>
              <span style={{color: VEL}} className="font-semibold">
                p&lt;0.0001
              </span>
            </span>
          </div>
        </div>

        {/* Forest Plot ───────────────────────────────────────────────────── */}
        <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
            Pre-specified subgroup analysis
          </p>
          <p className="text-sm font-semibold text-white mb-0.5">
            Forest Plot · Hazard Ratios (PFS)
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Cox proportional hazards · 95% CI · Interaction p &gt;0.05 (all)
          </p>

          <ResponsiveContainer width="100%" height={390}>
            <ScatterChart margin={{top: 5, right: 35, bottom: 32, left: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRD} horizontal={false} />
              <XAxis
                type="number"
                dataKey="hr"
                domain={[0.1, 1.15]}
                ticks={[0.25, 0.5, 0.75, 1.0]}
                tickFormatter={(v) => v.toFixed(2)}
                stroke={MUT}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                label={{
                  value: 'Hazard ratio',
                  position: 'insideBottom',
                  offset: -18,
                  fill: MUT,
                  fontSize: 10,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-1, forestRaw.length]}
                ticks={forestRaw.map((_, i) => i)}
                tickFormatter={(v) => forestRaw[v]?.sg ?? ''}
                width={120}
                stroke="none"
                tick={{fontSize: 9, fill: '#94a3b8'}}
                reversed
              />
              <Tooltip content={<ForestTip active={false} payload={[]} />} />
              <ReferenceLine x={1} stroke="#475569" strokeDasharray="4 4" strokeWidth={1.5} />
              <Scatter data={forestData} shape={Diamond}>
                <ErrorBar dataKey="errX" direction="x" width={4} strokeWidth={1.5} stroke={IND} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <p className="text-xs text-slate-500 text-center mt-1">
            <span style={{color: VEL}}>◀</span>&nbsp;Favors
            velarinib&nbsp;&nbsp;·&nbsp;&nbsp;Favors crizotinib&nbsp;
            <span style={{color: CRIZ}}>▶</span>
          </p>
        </div>
      </div>

      {/* ── Row 2: Biomarker · Dose-response · AE ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Biomarker scatter ──────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
            Translational biomarker
          </p>
          <p className="text-sm font-semibold text-white mb-0.5">ALK Copy Number vs. PFS</p>
          <p className="text-xs text-slate-500 mb-4">
            Next-gen sequencing · Spearman rank correlation
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{top: 5, right: 15, bottom: 32, left: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRD} />
              <XAxis
                type="number"
                dataKey="cnv"
                domain={[1, 11]}
                stroke={MUT}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                label={{
                  value: 'ALK copy number (NGS)',
                  position: 'insideBottom',
                  offset: -18,
                  fill: MUT,
                  fontSize: 10,
                }}
              />
              <YAxis
                type="number"
                dataKey="pfs"
                domain={[0, 52]}
                stroke={MUT}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                tickFormatter={(v) => `${v}mo`}
                label={{
                  value: 'PFS (months)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: MUT,
                  fontSize: 10,
                }}
              />
              <Tooltip contentStyle={TIP} formatter={(v, n) => [v, n]} />
              <Scatter data={velBio} name="Velarinib" fill={VEL} fillOpacity={0.65} r={3} />
              <Scatter data={crizBio} name="Crizotinib" fill={CRIZ} fillOpacity={0.55} r={3} />
            </ScatterChart>
          </ResponsiveContainer>

          <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span style={{color: VEL}}>● Velarinib</span>
              <span className="text-slate-400">Spearman ρ = 0.61 · p &lt; 0.001</span>
            </div>
            <div className="flex justify-between">
              <span style={{color: CRIZ}}>● Crizotinib</span>
              <span className="text-slate-400">Spearman ρ = 0.38 · p &lt; 0.001</span>
            </div>
          </div>
        </div>

        {/* Dose-response ──────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
            Phase Ib dose escalation
          </p>
          <p className="text-sm font-semibold text-white mb-0.5">
            Dose–Response: ORR &amp; Median PFS
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Emax sigmoidal model · RP2D 300 mg QD · MTD 450 mg
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={doseData} margin={{top: 10, right: 30, bottom: 32, left: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRD} />
              <XAxis
                dataKey="dose"
                stroke={MUT}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                label={{
                  value: 'Dose (mg QD)',
                  position: 'insideBottom',
                  offset: -18,
                  fill: MUT,
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="l"
                domain={[0, 100]}
                stroke={VEL}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="r"
                orientation="right"
                domain={[0, 35]}
                stroke={AMB}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                tickFormatter={(v) => `${v}mo`}
              />
              <Tooltip
                contentStyle={TIP}
                formatter={(v: any, n: string) => [n.includes('ORR') ? `${v}%` : `${v} mo`, n]}
              />

              {/* ORR 95% CI band */}
              <Area
                stackId="orr"
                yAxisId="l"
                type="monotone"
                dataKey="orrLo"
                stroke="none"
                fillOpacity={0}
              />
              <Area
                stackId="orr"
                yAxisId="l"
                type="monotone"
                dataKey="orrBand"
                stroke="none"
                fill="rgba(45,212,191,0.17)"
              />

              <Line
                yAxisId="l"
                type="monotone"
                dataKey="orr"
                stroke={VEL}
                strokeWidth={2.5}
                dot={{fill: VEL, r: 5, strokeWidth: 0}}
                name="ORR (%)"
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="pfs"
                stroke={AMB}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{fill: AMB, r: 4, strokeWidth: 0}}
                name="Median PFS (mo)"
              />
              <ReferenceLine yAxisId="l" x={300} stroke="#475569" strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-3 pt-3 border-t border-slate-800 flex gap-6 text-xs">
            <span style={{color: VEL}}>— ORR (left axis)</span>
            <span style={{color: AMB}}>– – Median PFS (right)</span>
            <span className="text-slate-600 ml-auto">│ 300 mg = RP2D</span>
          </div>
        </div>

        {/* Grade ≥3 AE profile ────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
            Safety · NCI CTCAE v5.0
          </p>
          <p className="text-sm font-semibold text-white mb-0.5">Grade ≥3 Adverse Events</p>
          <p className="text-xs text-slate-500 mb-4">
            Treatment-emergent · Safety population (n = 340)
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={aeData}
              layout="vertical"
              margin={{top: 5, right: 30, bottom: 22, left: 62}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRD} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 12]}
                stroke={MUT}
                tick={{fontSize: 10, fill: '#94a3b8'}}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: '% of patients',
                  position: 'insideBottom',
                  offset: -12,
                  fill: MUT,
                  fontSize: 10,
                }}
              />
              <YAxis
                type="category"
                dataKey="ae"
                stroke="none"
                tick={{fontSize: 10, fill: '#94a3b8'}}
                width={60}
              />
              <Tooltip contentStyle={TIP} formatter={(v, n) => [`${v}%`, n]} />
              <Bar
                dataKey="vel"
                name="Velarinib"
                fill={VEL}
                fillOpacity={0.85}
                radius={[0, 3, 3, 0]}
                barSize={10}
              />
              <Bar
                dataKey="criz"
                name="Crizotinib"
                fill={CRIZ}
                fillOpacity={0.75}
                radius={[0, 3, 3, 0]}
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 pt-3 border-t border-slate-800 flex gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 12,
                  height: 8,
                  background: VEL,
                  borderRadius: 2,
                  display: 'inline-block',
                }}
              />
              <span className="text-slate-400">Velarinib</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 12,
                  height: 8,
                  background: CRIZ,
                  borderRadius: 2,
                  display: 'inline-block',
                }}
              />
              <span className="text-slate-400">Crizotinib</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Statistical footnotes ── */}
      <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-600 space-y-1 leading-relaxed">
        <p>
          VELA-301 (NCT04821847) · Open-label, multicenter, phase III RCT · 1:1 via IVRS · Block
          size 4 · Stratified by brain metastases (yes/no), ECOG PS (0 vs 1–2), EML4-ALK variant (v1
          vs other)
        </p>
        <p>
          Primary: PFS by BICR (RECIST v1.1) · Key secondary: OS (planned interim), ORR, DOR, CNS
          ORR, CNS PFS, HRQoL (EORTC QLQ-LC13 / QLQ-C30)
        </p>
        <p>
          Statistics: stratified log-rank; Cox PH model (same strata); α = 0.05 two-sided;
          Clopper-Pearson exact 95% CI for proportions; Brookmeyer-Crowley 95% CI for medians
        </p>
        <p className="text-slate-800">
          All compound names, patient data, and trial details are entirely fictitious and for
          illustrative purposes only
        </p>
      </div>
    </div>
  )
}
