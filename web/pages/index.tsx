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
import {Row} from 'web/components/layout/row'
import {PageBase} from 'web/components/page-base'
import ClinicalRCTChart from 'web/components/widgets/ClinicalRCTChart'
import VELA301 from 'web/components/widgets/vela-curves'

export default function ProfilesPage() {
  return (
    <PageBase className={''} hideSidebar={true}>
      <h1 className={'max-w-5xl text-2xl font-bold mb-4 mx-auto justify-center items-center text-center'}>
        Personalized Pre-Session Preparation to Improve Engagement in Early Autism Intervention: A
        Randomized Repeated-Measures Crossover Study
      </h1>
      <Row className={'text-center gap-24 justify-center text-lg font-semibold'}>
        <p>Martin Braquet</p>
        <p>Riki Dewan</p>
      </Row>
      <div className="items-center lg:grid lg:grid-cols-2 gap-4">
        <Col className={'lg:col-span-1 break-words gap-4'}>
          <p>
            Children receiving early autism intervention often differ substantially in learning
            level, developmental profile, behavioral state, and response to session structure. At
            Maya Care and Grow in Agartala, India, children typically attend 2–16 hours per week,
            with sessions lasting 1–2 hours, and no child attends more than one session per day. The
            center serves 25 children with a wide age range, from 3 to 14 years old.
          </p>
          <p>
            Before sessions begin, practitioners currently use short preparatory activities such as
            blocks, jumping and body massage, blowing bubbles, meditation, puzzles, clay, cutting
            paper, stringing beads, and music listening or singing. Some children receive no formal
            preparation if they appear naturally engaged. These choices are made based on
            practitioner judgment, child history, and current mood, but there is little confidence
            that the selected preparation is the one most likely to maximize learning engagement.
          </p>
          <p>
            This creates an opportunity for a randomized study in a setting where treatment delivery
            is already routine and where data collection is feasible through close practitioner
            involvement. Because the children differ greatly in response and session attendance is
            repeated over time, a personalized repeated-measures design is especially suitable.
          </p>
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
