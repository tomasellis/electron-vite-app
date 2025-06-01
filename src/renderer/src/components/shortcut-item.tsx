import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip'

export default function ShortcutItem({ label, shortcut }): ReactElement {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <kbd className="px-3 py-1 bg-gray-700 rounded text-xs font-mono border border-gray-600">
              {shortcut}
            </kbd>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard shortcut</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
