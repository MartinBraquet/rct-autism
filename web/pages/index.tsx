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
import {Col} from 'web/components/layout/col'
import {PageBase} from 'web/components/page-base'
import ClinicalRCTChart from 'web/components/widgets/ClinicalRCTChart'
import {Row} from 'web/components/layout/row'
import VELA301 from 'web/components/widgets/vela-curves'

export default function ProfilesPage() {
  return (
    <PageBase className={''} hideSidebar={true}>
      <h1 className={'text-2xl font-bold mb-4 justify-center items-center text-center'}>
        Effect of pre-session prep on autistic children engagement
      </h1>
      <Row className={'text-center gap-24 justify-center text-lg font-semibold'}>
        <p>Martin Braquet</p>
        <p>Riki Dewan</p>
      </Row>
      <div className="items-center lg:grid lg:grid-cols-2 gap-4">
        <Col className={'lg:col-span-1 break-words'}>
          WelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcomeWelcome!
        </Col>
        <Col className={'lg:col-span-1 break-words'}>
          <h3 className="text-lg font-semibold mb-4">Sample Chart</h3>
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
        </Col>
      </div>
      <ClinicalRCTChart />
      <div className="mt-24"></div>
      <VELA301 />
    </PageBase>
  )
}
