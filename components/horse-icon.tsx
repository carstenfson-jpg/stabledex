import Image from 'next/image'

export type Tier = 'gold' | 'silver' | 'gray'

const TIER_CONFIG: Record<Tier, {
  bg: string
  border: string
  glowDefault: string
  glowHover: string
  filter: string
}> = {
  gold: {
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.22)',
    glowDefault: '0 0 6px rgba(251,191,36,0.18)',
    glowHover: '0 0 18px rgba(251,191,36,0.6), 0 0 5px rgba(251,191,36,0.35)',
    filter: 'invert(1) sepia(1) saturate(5) hue-rotate(15deg) brightness(1.1)',
  },
  silver: {
    bg: 'rgba(203,213,225,0.05)',
    border: 'rgba(203,213,225,0.18)',
    glowDefault: '0 0 6px rgba(203,213,225,0.12)',
    glowHover: '0 0 18px rgba(203,213,225,0.5), 0 0 5px rgba(203,213,225,0.25)',
    filter: 'invert(1) sepia(0.1) brightness(1.3)',
  },
  gray: {
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    glowDefault: 'none',
    glowHover: 'none',
    filter: 'invert(1) brightness(0.45)',
  },
}

export function getHorseTier(bestLevel: string | null): Tier {
  if (!bestLevel) return 'gray'
  const top = ['CSI5', 'GP', 'CDIO5', 'CCI4', 'CDI4', 'CDIO']
  const mid = ['CSI4', 'CSI3', 'CDI3', 'CCI3']
  if (top.some((l) => bestLevel.includes(l))) return 'gold'
  if (mid.some((l) => bestLevel.includes(l))) return 'silver'
  return 'gray'
}

interface HorseIconProps {
  tier: Tier
  active?: boolean
  size?: number
  boxSize?: number
  radius?: number
}

export function HorseIcon({ tier, active = false, size = 20, boxSize = 36, radius = 8 }: HorseIconProps) {
  const c = active ? TIER_CONFIG[tier] : TIER_CONFIG.gray

  return (
    <div
      style={{
        width: boxSize,
        height: boxSize,
        borderRadius: radius,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: active ? c.glowHover : 'none',
        transition: 'box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Image
        src="/horse-head.png"
        width={size}
        height={size}
        alt=""
        draggable={false}
        style={{
          objectFit: 'contain',
          filter: c.filter,
          transition: 'filter 0.2s ease',
        }}
      />
    </div>
  )
}
