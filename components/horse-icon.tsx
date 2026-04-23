import Image from 'next/image'

export type Tier = 'gold' | 'silver' | 'gray'

const TIER_CONFIG: Record<Tier, { filter: string; filterActive: string }> = {
  gold: {
    filter: 'invert(1) sepia(1) saturate(4) hue-rotate(15deg) brightness(1.05)',
    filterActive:
      'invert(1) sepia(1) saturate(5) hue-rotate(15deg) brightness(1.2) drop-shadow(0 0 5px rgba(251,191,36,0.8)) drop-shadow(0 0 12px rgba(251,191,36,0.45))',
  },
  silver: {
    filter: 'invert(1) sepia(0.1) brightness(1.2)',
    filterActive:
      'invert(1) sepia(0.1) brightness(1.5) drop-shadow(0 0 5px rgba(203,213,225,0.75)) drop-shadow(0 0 12px rgba(203,213,225,0.35))',
  },
  gray: {
    filter: 'invert(1) brightness(0.4)',
    filterActive: 'invert(1) brightness(0.55)',
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

export function HorseIcon({ tier, active = false, size = 20, boxSize = 36 }: HorseIconProps) {
  const c = TIER_CONFIG[tier]

  return (
    <div
      style={{
        width: boxSize,
        height: boxSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Image
        src="/horse-head.png"
        width={size}
        height={size}
        alt=""
        draggable={false}
        className="horse-icon-img"
        style={{
          objectFit: 'contain',
          filter: active ? c.filterActive : TIER_CONFIG.gray.filter,
          transition: 'filter 0.25s ease',
        }}
      />
    </div>
  )
}
