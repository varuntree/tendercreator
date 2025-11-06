'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link
      href="/projects"
      className="relative block h-8 w-40 hover:opacity-80 transition-opacity"
    >
      <Image
        src="/images/logo.png"
        alt="Tender Creator Logo"
        fill
        priority
        className="object-contain object-left"
      />
    </Link>
  )
}
