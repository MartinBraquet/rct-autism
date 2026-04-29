import Link from 'next/link'
import React from 'react'

export const CustomLink = ({
  href,
  children,
  style,
  className,
}: {
  href?: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) => {
  if (!href) return <>{children}</>

  // If href is internal, use Next.js Link
  if (href.startsWith('/')) {
    return (
      <Link href={href} style={style} className={className}>
        {children} <LinkIcon />
      </Link>
    )
  }

  // For external links, fall back to <a>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style} className={className}>
      {children} <LinkIcon />
    </a>
  )
}

function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
    // <FiExternalLink
    //   style={{
    //     marginLeft: '4px',
    //     display: 'inline',
    //     verticalAlign: 'middle',
    //     marginBottom: '2px',
    //   }}
    // />
  )
}