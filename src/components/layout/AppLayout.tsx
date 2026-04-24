import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TooltipProvider } from '@/components/ui/tooltip'

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-slate-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            tabIndex={-1}
          >
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
