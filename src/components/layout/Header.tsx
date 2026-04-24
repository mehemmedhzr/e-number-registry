import { type ReactNode } from 'react'
import { Minus, Plus, Type } from 'lucide-react'
import { SidebarToggle } from './Sidebar'
import { Button } from '@/components/ui/button'
import { useFontSize } from '@/hooks/useFontSize'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HeaderProps {
  title?: string
  actions?: ReactNode
  onMenuToggle: () => void
}

export function Header({ title, actions, onMenuToggle }: HeaderProps) {
  const { decrease, increase, reset } = useFontSize()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
      <SidebarToggle onClick={onMenuToggle} />

      {title && (
        <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Font size controls */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={decrease} aria-label="Şrifti kiçilt">
                <Minus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Şrifti kiçilt</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Şrifti sıfırla">
                <Type className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Şrifti sıfırla</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={increase} aria-label="Şrifti böyüt">
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Şrifti böyüt</TooltipContent>
          </Tooltip>
        </div>

        {actions}
      </div>
    </header>
  )
}
