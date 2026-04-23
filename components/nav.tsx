import Link from 'next/link'
import NavWatchlist from './nav-watchlist'
import NavPaletteButton from './nav-palette-button'

export default function Nav() {
  return (
    <nav className="border-b border-white/[.07] bg-[#0f0f0f]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.15em] text-[#f2f2f2] hover:text-white transition-colors"
        >
          STABLEDEX
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-[#6b7280] hover:text-[#f2f2f2] transition-colors"
          >
            Database
          </Link>
          <Link
            href="/rankings"
            className="text-sm text-[#6b7280] hover:text-[#f2f2f2] transition-colors"
          >
            Rankings
          </Link>
          <Link
            href="/events"
            className="text-sm text-[#6b7280] hover:text-[#f2f2f2] transition-colors"
          >
            Events
          </Link>
          <NavWatchlist />
          <NavPaletteButton />
        </div>
      </div>
    </nav>
  )
}
