import clsx from 'clsx'
import {useRouter} from 'next/router'
import {LanguagePicker} from 'web/components/language/language-picker'
import SiteLogo from 'web/components/site-logo'
import ThemeIcon from 'web/components/theme-icon'

import {Item, SidebarItem} from './sidebar-item'

export default function Sidebar(props: {
  className?: string
  isMobile?: boolean
  navigationOptions: Item[]
}) {
  const {className} = props
  const router = useRouter()
  const currentPage = router.pathname

  const navOptions = props.navigationOptions

  return (
    <nav
      id="main-navigation"
      aria-label="Sidebar"
      data-testid="sidebar"
      className={clsx(
        'flex flex-col h-[calc(100dvh-var(--hloss))] mb-[calc(var(--bnh))] mt-[calc(var(--tnh))]',
        className,
      )}
    >
      <SiteLogo className={''} />

      {<div className="h-[24px]" />}

      <div className="mb-4 flex flex-col gap-1 !overflow-y-auto">
        {navOptions.map((item) => (
          <SidebarItem key={item.key} item={item} currentPage={currentPage} />
        ))}
      </div>
      <div className="mb-[12px] mt-auto flex flex-col gap-3">
        <ThemeIcon />
        <LanguagePicker className={'w-fit mx-3 pr-12 mb-2'} />
      </div>
    </nav>
  )
}
