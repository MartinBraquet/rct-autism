import React from 'react'

export function SectionHeader({
  label,
  title,
  body,
  light,
}: {
  label: string
  title: string
  body?: string
  light?: boolean
}) {
  const muted = light ? 'rgba(250,246,240,0.7)' : '#7a7060'
  const titleColor = light ? '#fffef9' : '#1e1a14'
  const labelColor = light ? '#c49a72' : '#c49a72'
  return (
    <div>
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: '0.75rem',
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          color: titleColor,
          marginBottom: '1.25rem',
        }}
      >
        {title}
      </h2>
      {body && (
        <p style={{fontSize: '1rem', lineHeight: 1.8, color: muted, maxWidth: 680}}>{body}</p>
      )}
    </div>
  )
}