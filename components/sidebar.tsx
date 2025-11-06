'use client'

import {
  BookOpen,
  Building2,
  ChevronLeft,
  CreditCard,
  FileQuestion,
  FileText,
  Home,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'home', name: 'Home', href: '/projects', icon: Home },
  { id: 'company', name: 'Company', href: '/settings', icon: Building2 },
  { id: 'tenders', name: 'Tenders', href: '/projects', icon: FileText },
  { id: 'team', name: 'Team', href: '/settings/team', icon: Users },
  { id: 'billing', name: 'Billing', href: '/settings/billing', icon: CreditCard },
  { id: 'settings', name: 'Settings', href: '/settings', icon: Settings },
  { id: 'resources', name: 'Useful Resources', href: '/resources', icon: BookOpen },
  { id: 'docs', name: 'Documentation', href: '/docs', icon: FileQuestion },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    setIsCollapsed(collapsed)
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const isActive = (item: { id: string; href: string }) => {
    // For /projects route, only show Home as active (not Tenders)
    if (item.href === '/projects') {
      const isProjectsRoute = pathname === '/projects' || pathname.startsWith('/projects/')
      return item.id === 'home' && isProjectsRoute
    }
    // For /settings, prioritize more specific routes
    if (item.href === '/settings') {
      // Show active for Settings only if on exactly /settings or /settings/documents
      return pathname === '/settings' || pathname === '/settings/documents'
    }
    // For other routes, check if path starts with href
    return pathname.startsWith(item.href)
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-4">
        {!isCollapsed && <Logo />}
        {isCollapsed && (
          <Link href="/projects" className="flex items-center justify-center hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
          </Link>
        )}
      </div>

      {/* Create New Tender Button */}
      <div className="p-4">
        <Button
          asChild
          className={cn(
            'w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors',
            isCollapsed ? 'px-0' : 'px-4'
          )}
        >
          <Link href="/projects/new" className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Create new tender</span>}
          </Link>
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200',
                active
                  ? 'bg-emerald-50 text-emerald-600 font-medium border-l-4 border-emerald-600 pl-2'
                  : 'text-gray-600 hover:bg-gray-50',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(
            'w-full flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-gray-50',
            isCollapsed && 'px-0'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform duration-300',
              isCollapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </aside>
  )
}
