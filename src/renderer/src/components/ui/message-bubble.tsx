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
  const audioMessage = message.message?.audioMessage as (proto.Message.AudioMessage & { localPath?: string }) | undefined

  const timestamp = message.messageTimestamp
    ? new Date((typeof message.messageTimestamp === 'number' ? message.messageTimestamp : message.messageTimestamp.low) * 1000).toLocaleTimeString()
    : ''

  const isRead = message.status === 4 // READ
  const isDelivered = message.status === 3 // DELIVERY_ACK

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-3 max-w-xs ${isOwn ? 'bg-[#0f8a6d]' : 'bg-gray-700'}`}
      >
        {audioMessage ? (
          <audio
            controls
            className="w-[200px]"
            src={audioMessage.localPath}
          >
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p className="text-sm">{messageContent}</p>
        )}
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
