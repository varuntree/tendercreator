export type BreadcrumbSegment = {
  label: string
  href?: string
}

export type BreadcrumbEventDetail = {
  segments: BreadcrumbSegment[]
}

export const BREADCRUMB_EVENT = 'tendercreator:set-breadcrumbs'
export const BREADCRUMB_CLEAR_EVENT = 'tendercreator:clear-breadcrumbs'

export function setBreadcrumbs(segments: BreadcrumbSegment[]) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<BreadcrumbEventDetail>(BREADCRUMB_EVENT, { detail: { segments } }))
}

export function clearBreadcrumbs() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(BREADCRUMB_CLEAR_EVENT))
}
