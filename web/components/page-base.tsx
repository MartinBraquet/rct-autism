import {HomeIcon, QuestionMarkCircleIcon} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import {ReactNode, useState} from 'react'
import {Toaster} from 'react-hot-toast'
import {Col} from 'web/components/layout/col'
import {BottomNavBar} from 'web/components/nav/bottom-nav-bar'
import {SkipLink} from 'web/components/skip-link'
import {useIsMobile} from 'web/hooks/use-is-mobile'
import {buildArray} from 'web/lib/util/array'

import Sidebar from './nav/sidebar'

export function PageBase(props: {
  trackPageProps?: Record<string, any>
  className?: string
  children?: ReactNode
  hideSidebar?: boolean
  hideBottomBar?: boolean
}) {
  const {children, className, hideSidebar, hideBottomBar} = props
  const isMobile = useIsMobile()

  const bottomNavOptions = getBottomSignedOutNavigation()
  // const [isModalOpen, setIsModalOpen] = useState(false)
  const desktopSidebarOptions = getDesktopNavigation()

  const mobileSidebarOptions = getMobileSidebar(() => setIsAddFundsModalOpen(true))

  const [_, setIsAddFundsModalOpen] = useState(false)

  const colSpan =
    !hideSidebar && (className?.split(' ').find((c) => c.startsWith('col-span-')) ?? 'col-span-8')
  const restClassName = className
    ?.split(' ')
    .filter((c) => !c.startsWith('col-span-'))
    .join(' ')

  return (
    <>
      <SkipLink />
      <Col
        className={clsx(
          'pb-page-base lg:pb-0', // bottom bar padding
          'text-ink-1000 mx-auto min-h-screen w-full',
          !hideSidebar && 'lg:grid lg:grid-cols-12',
        )}
      >
        <Toaster
          position={isMobile ? 'bottom-center' : 'top-center'}
          containerClassName="!bottom-[70px]"
        />
        {!hideSidebar && (
          <Sidebar
            navigationOptions={desktopSidebarOptions}
            className="sticky top-0 hidden self-start px-2 lg:col-span-2 lg:flex sidebar-nav bg-canvas-50"
          />
        )}
        <main
          id="main-content"
          tabIndex={-1}
          className={clsx('flex flex-1 flex-col lg:mt-6 xl:px-2', colSpan, restClassName)}
        >
          {children}
        </main>
      </Col>
      {!hideBottomBar && (
        <BottomNavBar
          sidebarNavigationOptions={mobileSidebarOptions as any[]}
          navigationOptions={bottomNavOptions}
        />
      )}
    </>
  )
}

const Home = {key: 'nav.home', name: 'Home', href: '/', icon: HomeIcon}
// const faq = {
//   key: 'nav.faq',
//   name: 'FAQ',
//   href: '/faq',
//   icon: SolidQuestionIcon,
// }
const About = {
  key: 'nav.about',
  name: 'About',
  href: '/about',
  icon: QuestionMarkCircleIcon,
}
// const Social = {
//   key: 'nav.social',
//   name: 'Socials',
//   href: '/social',
//   icon: LinkIcon,
// }
// const Organization = {
//   key: 'nav.organization',
//   name: 'Organization',
//   href: '/organization',
//   icon: GlobeAltIcon,
// }
// const Contact = {
//   key: 'nav.contact',
//   name: 'Contact',
//   href: '/contact',
//   icon: FaEnvelope,
// }
// const News = {
//   key: 'nav.news',
//   name: "What's new",
//   href: '/news',
//   icon: NewspaperIcon,
// }

const base = [About]

const getBottomSignedOutNavigation = () => [Home, About]

const getDesktopNavigation = () => {
  return buildArray(...base)
}

const getMobileSidebar = (_toggleModal: () => void) => {
  return buildArray(...base)
}
