import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SampleChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={[
          {name: 'Jan', value: 400},
          {name: 'Feb', value: 300},
          {name: 'Mar', value: 600},
          {name: 'Apr', value: 800},
          {name: 'May', value: 500},
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default SampleChart
