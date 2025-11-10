'use client'

import { Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { useMediaQuery } from '@/hooks/use-media-query'
import {
  BREADCRUMB_CLEAR_EVENT,
  BREADCRUMB_EVENT,
  type BreadcrumbEventDetail,
  type BreadcrumbSegment,
} from '@/libs/utils/breadcrumbs'

const defaultProjectsCrumb: BreadcrumbSegment = { label: 'Projects', href: '/projects' }

const deriveFallbackSegments = (pathname: string): BreadcrumbSegment[] => {
  if (!pathname || pathname === '/' || pathname === '/projects') {
    return [{ label: 'Projects' }]
  }

  if (pathname.startsWith('/projects/')) {
    const [, , projectId] = pathname.split('/')
    return [
      defaultProjectsCrumb,
      {
        label: 'Project',
        href: projectId ? `/projects/${projectId}` : undefined,
      },
    ]
  }

  if (pathname.startsWith('/work-packages/')) {
    return [defaultProjectsCrumb, { label: 'Document' }]
  }

  if (pathname.startsWith('/settings')) {
    return [{ label: 'Settings' }]
  }

  return [{ label: 'Projects' }]
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const [customSegments, setCustomSegments] = useState<BreadcrumbSegment[] | null>(null)
  const { isAtMost } = useMediaQuery()

  useEffect(() => {
    const handleSet = (event: Event) => {
      const detail = (event as CustomEvent<BreadcrumbEventDetail>).detail
      if (detail?.segments?.length) {
        setCustomSegments(detail.segments)
      }
    }

    const handleClear = () => {
      setCustomSegments(null)
    }

    window.addEventListener(BREADCRUMB_EVENT, handleSet)
    window.addEventListener(BREADCRUMB_CLEAR_EVENT, handleClear)

    return () => {
      window.removeEventListener(BREADCRUMB_EVENT, handleSet)
      window.removeEventListener(BREADCRUMB_CLEAR_EVENT, handleClear)
    }
  }, [])

  const fallbackSegments = useMemo(() => deriveFallbackSegments(pathname), [pathname])
  const segments = customSegments && customSegments.length ? customSegments : fallbackSegments
  const lastIndex = segments.length - 1
  const showTruncated = isAtMost('sm') && segments.length > 2

  const renderSegment = (segment: BreadcrumbSegment, isLast = false) =>
    segment.href && !isLast ? (
      <Link href={segment.href} className="text-gray-500 transition-colors hover:text-gray-900">
        {segment.label}
      </Link>
    ) : (
      <span className={isLast ? 'text-gray-900 font-semibold' : undefined}>
        {segment.label}
      </span>
    )

  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-gray-600">
      <Link href="/projects" className="text-gray-500 transition-colors hover:text-gray-900">
        <Home className="h-4 w-4" />
      </Link>
      {showTruncated ? (
        <>
          <span className="text-gray-300">/</span>
          {renderSegment(segments[0])}
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">…</span>
          <span className="text-gray-300">/</span>
          {renderSegment(segments[lastIndex], true)}
        </>
      ) : (
        segments.map((segment, index) => (
          <Fragment key={`${segment.label}-${index}`}>
            <span className="text-gray-300">/</span>
            {renderSegment(segment, index === lastIndex)}
          </Fragment>
        ))
      )}
    </nav>
  )
}
