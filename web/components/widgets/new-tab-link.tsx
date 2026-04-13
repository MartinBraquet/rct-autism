import Link from 'next/link'

interface NewTabLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NewTabLink({href, children, className, onClick}: NewTabLinkProps) {
  // New tabs don't work on native apps
  return (
    <Link
      href={href}
      onClick={onClick}
      target={'_blank'}
      className={className}
    >
      {children}
    </Link>
  )
}
