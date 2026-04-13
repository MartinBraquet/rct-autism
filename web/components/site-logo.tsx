import clsx from 'clsx'
import Link from 'next/link'
import FavIconBlack from 'web/components/FavIcon'
import {Row} from 'web/components/layout/row'
import {IS_PROD} from 'web/lib/constants'

export default function SiteLogo(props: {noLink?: boolean; className?: string}) {
  const {noLink, className} = props
  const inner = (
    <>
      <FavIconBlack className="dark:invert" />
      <div className={clsx('my-auto text-xl font-thin logo')}>
        {IS_PROD ? 'rct-autism' : 'rct-autism dev'}
      </div>
    </>
  )
  if (noLink) {
    return <Row className={clsx('gap-1 pb-2 pt-2 sm:pt-6', className)}>{inner}</Row>
  }
  return (
    <Link href={'/'} className={clsx('flex flex-row gap-1 pb-2 pt-2 sm:pt-6', className)}>
      {inner}
    </Link>
  )
}
