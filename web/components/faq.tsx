import {useState} from 'react'

export function FaqItem({q, a}: {q: string; a: string}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{borderBottom: '1px solid #e8dece', padding: '1.5rem 0'}}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#1e1a14',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {q}
        <span
          style={{
            fontSize: '1.4rem',
            color: '#c49a72',
            flexShrink: 0,
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </div>
      <div
        style={{
          fontSize: '0.92rem',
          lineHeight: 1.75,
          color: '#7a7060',
          maxHeight: open ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, padding-top 0.2s',
          paddingTop: open ? '1rem' : 0,
        }}
      >
        {a}
      </div>
    </div>
  )
}
