import { Check, CheckCheck } from 'lucide-react'
import { IncomingMessage } from '../../types'
import { ReactElement } from 'react'

interface MessageBubbleProps {
  message: IncomingMessage
}

export function MessageBubble({ message }: MessageBubbleProps): ReactElement {
  const isFromMe = message.key.fromMe
  const messageContent = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
  const timestamp = new Date(Number(message.messageTimestamp) * 1000).toLocaleTimeString()

  const isRead = message.status === 'READ'
  const isDelivered = message.status === 'DELIVERY_ACK'

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-3 max-w-xs ${isFromMe ? 'bg-[#0f8a6d]' : 'bg-gray-700'
          }`}
      >
        <p className="text-sm">{messageContent}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs text-gray-300">{timestamp}</span>
          {isFromMe && (
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
