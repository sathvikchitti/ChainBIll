'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

interface NavItem {
  label: string
  href: string
}

interface PillNavProps {
  logo: string
  logoAlt?: string
  items: NavItem[]
  activeHref?: string
  ctaLabel?: string
  ctaHref?: string
  className?: string
  ease?: string
}

export default function PillNav({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  ctaLabel = 'Sign up',
  ctaHref = '/sign-up',
  className = '',
  ease = 'power3.easeOut',
}: PillNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const logoImgRef = useRef<HTMLImageElement>(null)
  const logoTweenRef = useRef<gsap.core.Tween | null>(null)

  // Refs for GSAP bubble animation
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tlRefs = useRef<gsap.core.Timeline[]>([])
  const activeTweenRefs = useRef<gsap.core.Tween[]>([])

  const navItems = items.filter(i => i.href !== ctaHref)

  // Build GSAP timelines for each nav pill
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return
        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` })

        const label = pill.querySelector('.pill-label')
        const labelHover = pill.querySelector('.pill-label-hover')
        if (label) gsap.set(label, { y: 0 })
        if (labelHover) gsap.set(labelHover, { y: h + 12, opacity: 0 })

        tlRefs.current[i]?.kill()
        const tl = gsap.timeline({ paused: true })
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        if (labelHover) {
          gsap.set(labelHover, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(labelHover, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }
        tlRefs.current[i] = tl
      })
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready.then(layout).catch(() => {})
    return () => window.removeEventListener('resize', layout)
  }, [navItems.length, ease])

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' })
  }

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' })
  }

  const handleLogoEnter = () => {
    if (!logoImgRef.current) return
    logoTweenRef.current?.kill()
    gsap.set(logoImgRef.current, { rotate: 0 })
    logoTweenRef.current = gsap.to(logoImgRef.current, { rotate: 360, duration: 0.4, ease })
  }

  return (
    <header className={`relative w-full flex justify-center pt-4 z-50 ${className}`}>
      <nav
        className="mx-4 md:mx-8 w-full max-w-5xl flex items-center justify-between px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(28,12,60,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(167,139,250,0.3)',
          boxShadow: '0 4px 32px rgba(107,70,193,0.18)',
        }}
      >
        {/* Left — Logo + Brand name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0"
          onMouseEnter={handleLogoEnter}
        >
          <div
            className="rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              padding: '5px',
              background: 'rgb(167,139,250)',
              boxShadow: '0 2px 12px rgba(167,139,250,0.45)',
            }}
          >
            <img
              src={logo}
              alt={logoAlt}
              ref={logoImgRef}
              className="w-full h-full object-contain block"
            />
          </div>
          <span
            className="font-semibold text-[17px] tracking-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: '#f0eaff' }}
          >
            ChainBill
          </span>
        </Link>

        {/* Right — Nav pills + CTA */}
        <div
          className="hidden md:flex items-center rounded-full"
          style={{
            height: '38px',
            background: 'rgba(167,139,250,0.10)',
            border: '1px solid rgba(167,139,250,0.22)',
          }}
        >
          <ul className="list-none flex items-stretch m-0 p-[3px] h-full gap-[3px]">
            {navItems.map((item, i) => {
              const isActive = activeHref === item.href
              return (
                <li key={item.href} className="flex h-full">
                  <Link
                    href={item.href}
                    className="relative overflow-hidden inline-flex items-center justify-center h-full rounded-full px-5 font-semibold text-[13px] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer no-underline"
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      background: isActive ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.15)',
                      color: 'rgba(220,210,255,0.85)',
                    }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {/* GSAP bubble circle */}
                    <span
                      className="absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{ background: 'rgba(167,139,250,0.55)', willChange: 'transform' }}
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el }}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: 'transform' }}>
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                        style={{ color: '#1c0a40', willChange: 'transform, opacity' }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}

            {/* CTA */}
            <li className="flex h-full ml-1">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center h-full rounded-full px-5 font-semibold text-[13px] uppercase tracking-[0.2px] whitespace-nowrap no-underline transition-all duration-200"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  background: '#a78bfa',
                  color: '#1c0a40',
                  boxShadow: '0 2px 12px rgba(167,139,250,0.4)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = '#c4b5fd'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(167,139,250,0.55)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = '#a78bfa'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(167,139,250,0.4)'
                }}
              >
                {ctaLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl"
          style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-4 h-0.5 rounded" style={{ background: '#c4b5fd', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(5px) rotate(45deg)' : 'none' }} />
          <span className="block w-4 h-0.5 rounded" style={{ background: '#c4b5fd', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-20 left-4 right-4 rounded-2xl p-2 flex flex-col gap-1 z-50"
          style={{
            background: 'rgba(28,12,60,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(167,139,250,0.3)',
            boxShadow: '0 8px 32px rgba(107,70,193,0.25)',
          }}
        >
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium"
              style={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(220,210,255,0.85)' }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="mt-1 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-center"
            style={{ fontFamily: '"JetBrains Mono", monospace', background: '#a78bfa', color: '#1c0a40' }}
            onClick={() => setMobileOpen(false)}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </header>
  )
}
