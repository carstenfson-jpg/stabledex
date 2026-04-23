'use client'

export default function NavPaletteButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('stabledex_palette'))}
      className="flex items-center gap-1.5 text-xs text-[#4b5563] hover:text-[#9ca3af] border border-[0.5px] border-white/[.07] rounded-md px-2 h-7 transition-colors"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <kbd className="font-sans">⌘K</kbd>
    </button>
  )
}
