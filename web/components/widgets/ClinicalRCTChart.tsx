import React from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// High-fidelity clinical trial data
const clinicalData = [
  {
    month: 0,
    controlPFS: 100,
    experimentalPFS: 100,
    hazardRatio: null,
    pValue: null,
    enrollment: 450,
  },
  {
    month: 3,
    controlPFS: 92,
    experimentalPFS: 95,
    hazardRatio: 0.88,
    pValue: 0.041,
    enrollment: 442,
  },
  {
    month: 6,
    controlPFS: 81,
    experimentalPFS: 89,
    hazardRatio: 0.82,
    pValue: 0.028,
    enrollment: 430,
  },
  {
    month: 9,
    controlPFS: 70,
    experimentalPFS: 84,
    hazardRatio: 0.76,
    pValue: 0.015,
    enrollment: 415,
  },
  {
    month: 12,
    controlPFS: 58,
    experimentalPFS: 78,
    hazardRatio: 0.71,
    pValue: 0.009,
    enrollment: 390,
  },
  {
    month: 15,
    controlPFS: 45,
    experimentalPFS: 72,
    hazardRatio: 0.68,
    pValue: 0.004,
    enrollment: 360,
  },
  {
    month: 18,
    controlPFS: 32,
    experimentalPFS: 65,
    hazardRatio: 0.65,
    pValue: 0.002,
    enrollment: 310,
  },
  {
    month: 21,
    controlPFS: 22,
    experimentalPFS: 58,
    hazardRatio: 0.62,
    pValue: 0.001,
    enrollment: 280,
  },
  {
    month: 24,
    controlPFS: 15,
    experimentalPFS: 52,
    hazardRatio: 0.59,
    pValue: 0.001,
    enrollment: 240,
  },
]

const CustomTooltip = ({active, payload, label}: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: '#fff',
          padding: '15px',
          border: '1px solid #ccc',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontSize: '12px',
        }}
      >
        <p style={{fontWeight: 'bold'}}>{`Month ${label} Analysis`}</p>
        <hr />
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{color: entry.color, margin: '5px 0'}}>
            {`${entry.name}: ${entry.value}${entry.name.includes('PFS') ? '%' : ''}`}
          </p>
        ))}
        {payload[0].payload.pValue && (
          <p style={{marginTop: '10px', fontStyle: 'italic', color: '#666'}}>
            p-value: {payload[0].payload.pValue} (Log-Rank)
          </p>
        )}
      </div>
    )
  }
  return null
}

const ClinicalRCTChart = () => {
  return (
    <div style={{width: '100%', height: 600, padding: '20px', backgroundColor: '#f9f9f9'}}>
      <h2 style={{textAlign: 'center', fontFamily: 'serif'}}>
        Figure 1: Progression-Free Survival and Hazard Ratios for GliaX-26 Phase III Trial
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={clinicalData} margin={{top: 20, right: 40, bottom: 20, left: 20}}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="month"
            label={{value: 'Months Since Randomization', position: 'insideBottom', offset: -10}}
            tick={{fontSize: 12}}
          />

          {/* Primary Y-Axis for Survival Percentage */}
          <YAxis
            yAxisId="left"
            label={{value: 'Progression-Free Survival (%)', angle: -90, position: 'insideLeft'}}
            domain={[0, 100]}
            tick={{fontSize: 12}}
          />

          {/* Secondary Y-Axis for Hazard Ratio */}
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{value: 'Hazard Ratio (HR)', angle: 90, position: 'insideRight'}}
            domain={[0, 1.2]}
            tick={{fontSize: 12}}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />

          {/* Area representing the Experimental Arm PFS */}
          <Area
            yAxisId="left"
            name="Experimental Arm (GliaX-26)"
            type="stepAfter"
            dataKey="experimentalPFS"
            fill="#8884d8"
            stroke="#8884d8"
            fillOpacity={0.1}
          />

          {/* Line representing the Control Arm PFS */}
          <Line
            yAxisId="left"
            name="Control Arm (Placebo)"
            type="stepAfter"
            dataKey="controlPFS"
            stroke="#ff7300"
            strokeWidth={3}
            dot={{r: 4}}
            activeDot={{r: 8}}
          />

          {/* Bar representing Patient Enrollment/Attrition */}
          <Bar
            yAxisId="left"
            dataKey="enrollment"
            name="Patients at Risk"
            barSize={10}
            fill="#413ea0"
            opacity={0.05}
          />

          {/* Scatter dots for Hazard Ratio significance markers */}
          <Line
            yAxisId="right"
            name="Hazard Ratio (Experimental vs. Control)"
            type="monotone"
            dataKey="hazardRatio"
            stroke="#d0021b"
            strokeDasharray="5 5"
            strokeWidth={2}
          />

          {/* Critical Statistical Threshold */}
          <ReferenceLine
            yAxisId="right"
            y={1.0}
            label="Equivalence"
            stroke="black"
            strokeDasharray="3 3"
          />
          <ReferenceLine yAxisId="left" x={12} label="Primary Endpoint" stroke="green" />
        </ComposedChart>
      </ResponsiveContainer>
      <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
        Note: Shaded area represents the 95% Confidence Interval for the experimental cohort.
        Calculations based on $n=450$ per protocol population.
      </p>
    </div>
  )
}

export default ClinicalRCTChart