import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  ClipboardCheck,
  LogOut,
  PhoneCall,
  X,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'İdarə paneli',
    to: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4 flex-shrink-0" />,
  },
  {
    label: 'Ümumi reyestr',
    to: '/registrations',
    icon: <ListOrdered className="h-4 w-4 flex-shrink-0" />,
  },
  {
    label: 'Yeni qeydiyyat',
    to: '/registrations/create',
    icon: <PlusCircle className="h-4 w-4 flex-shrink-0" />,
    roles: ['icta'],
  },
  {
    label: 'Qaralamalar',
    to: '/registrations/drafts',
    icon: <ClipboardCheck className="h-4 w-4 flex-shrink-0" />,
    roles: ['icta'],
  },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role, logout } = useAuthStore()

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(role || '')
  })

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Kabinet menyusu"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">E-Nömrə</div>
              <div className="text-xs text-slate-400 leading-tight">Reyestr</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 text-slate-400 hover:text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-label="Menyunu bağla"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Role pill */}
        {role && (
          <div className="px-5 py-3 border-b border-slate-700">
            <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {role.toUpperCase()} kabineti
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1" role="list">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Separator className="bg-slate-700" />

        {/* Logout */}
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Çıxış</span>
          </Button>
        </div>
      </aside>
    </>
  )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
      aria-label="Menyunu aç"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
