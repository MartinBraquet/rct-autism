import {Col} from 'web/components/layout/col'
import {PageBase} from 'web/components/page-base'

export default function ProfilesPage() {
  return (
    <PageBase trackPageView={'home'} className={'col-span-10'}>
      <Col className="items-center">
        <Col className={'w-full rounded px-3 sm:px-4'}>
          Welcome!
        </Col>
      </Col>
    </PageBase>
  )
}
