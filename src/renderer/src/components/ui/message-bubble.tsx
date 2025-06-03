import { Check, CheckCheck } from 'lucide-react'
import { IncomingMessage } from '../../types'
import { ReactElement } from 'react'
import { proto } from 'baileys'

interface MessageBubbleProps {
  message: IncomingMessage
  isOwn?: boolean
}

export function MessageBubble({ message, isOwn = false }: MessageBubbleProps): ReactElement {
  const messageContent = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
  const timestamp = new Date(Number(message.messageTimestamp) * 1000).toLocaleTimeString()

  const isRead = message.status === proto.WebMessageInfo.Status.READ
  const isDelivered = message.status === proto.WebMessageInfo.Status.DELIVERY_ACK

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-3 max-w-xs ${isOwn ? 'bg-[#0f8a6d]' : 'bg-gray-700'}`}
      >
        <p className="text-sm">{messageContent}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs text-gray-300">{timestamp}</span>
          {isOwn && (
            <span className="text-xs text-gray-300">
              {isRead || isDelivered ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
