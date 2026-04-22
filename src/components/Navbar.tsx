import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface NavbarProps {
  manager: string
  onLogout: () => void
}

const NAV_ITEMS = ['Dashboard', 'Employees', 'Departments', 'Reports', 'Settings']

const NAV_ROUTES: Record<string, string> = {
  Dashboard: '/',
  Employees: '/employees',
  Departments: '/departments',
  Reports: '/reports',
  Settings: '/settings',
}

export function Navbar({ manager, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activePage = NAV_ITEMS.find((item) =>
    item === 'Dashboard' ? pathname === '/' : pathname.startsWith(NAV_ROUTES[item])
  ) ?? 'Dashboard'

  return (
    <header className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-white text-sm font-bold">
              EM
            </div>
            <span className="font-semibold text-[hsl(var(--foreground))] hidden sm:block">
              Employee Portal
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() => navigate(NAV_ROUTES[item])}
                className={cn(
                  activePage === item && 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.15)] hover:text-[hsl(var(--primary))]'
                )}
              >
                {item}
              </Button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{manager[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-[hsl(var(--muted-foreground))] max-w-[140px] truncate">{manager}</span>
            </div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 pb-3 pt-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start',
                activePage === item && 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.15)] hover:text-[hsl(var(--primary))]'
              )}
              onClick={() => { navigate(NAV_ROUTES[item]); setMenuOpen(false) }}
            >
              {item}
            </Button>
          ))}
        </div>
      )}
    </header>
  )
}
