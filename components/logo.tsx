'use client'

import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
}

export default function Logo({ collapsed = false }: LogoProps) {
  const src = collapsed ? '/images/logo-icon.png' : '/images/logo.png'
  return (
    <Link
      href="/projects"
      className={cn(
        'relative block overflow-hidden transition-all duration-300 hover:opacity-80',
        collapsed ? 'h-12 w-12 rounded-2xl' : 'h-12 w-48'
      )}
      aria-label="Tender Creator"
    >
      <Image
        src={src}
        alt="Tender Creator Logo"
        fill
        priority
        className="object-contain object-center transition-all duration-300"
      />
    </Link>
  )
}
