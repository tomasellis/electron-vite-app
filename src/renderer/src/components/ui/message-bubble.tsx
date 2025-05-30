import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '../../App.tsx'
import { ReactElement } from 'react'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps): ReactElement {
  const getStatusIcon = (): ReactElement | null => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs lg:max-w-md px-4 py-2 rounded-lg
          ${message.isOwn ? 'bg-green-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}
        `}
      >
        <p className="text-sm">{message.text}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${message.isOwn ? 'text-green-100' : 'text-gray-500'}`}
        >
          <span className="text-xs">{message.timestamp}</span>
          {message.isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  )
}
