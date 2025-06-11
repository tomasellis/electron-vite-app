import { Check, CheckCheck, Mic } from 'lucide-react'
import { AudioMessage, IncomingMessage } from '../../types'
import { ReactElement, useState } from 'react'
import { Button } from './button'

interface MessageBubbleProps {
  message: IncomingMessage
  isOwn?: boolean
}

export function MessageBubble({ message, isOwn = false }: MessageBubbleProps): ReactElement {


  const messageContent = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
  const audioMessage = message.message?.audioMessage as AudioMessage
  const transcribedAudio = audioMessage?.transcribedText


  const timestamp = message.messageTimestamp
    ? new Date((typeof message.messageTimestamp === 'number' ? message.messageTimestamp : message.messageTimestamp.low) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  const isRead = message.status === 4
  const isDelivered = message.status === 3

  console.log('MESSAGE>>>>>', audioMessage, transcribedAudio)
  const selfMsgBg = "rgb(20,77,55)"
  const otherMsgBg = "rgb(36,38,38)"
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end pr-4' : 'justify-start pl-4'}`}>
      <div
        className='flex-col rounded-lg p-3.5 max-w-xs'
        style={{
          backgroundColor: isOwn ? selfMsgBg : otherMsgBg,
        }}
      >
        {audioMessage ? (
          <>
            <audio
              controls
              src={audioMessage.localPath}
            >
              Your browser does not support the audio element.
            </audio>
            {transcribedAudio && (
              <div className="mt-2 text-sm text-gray-200 break-words whitespace-pre-wrap">
                {transcribedAudio}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm">{messageContent}</p>
        )}
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs text-gray-300">{timestamp}</span>
          {/* {isOwn && (
            <span className="text-xs text-gray-300">
              {isRead || isDelivered ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )} */}
        </div>
      </div>
    </div>
  )
}
