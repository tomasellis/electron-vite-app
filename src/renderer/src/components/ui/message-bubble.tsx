import { Check, CheckCheck, Mic } from 'lucide-react'
import { AudioMessage, IncomingMessage } from '../../types'
import { ReactElement, useState } from 'react'
import { Button } from './button'

interface MessageBubbleProps {
  message: IncomingMessage
  isOwn?: boolean
}

export function MessageBubble({ message, isOwn = false }: MessageBubbleProps): ReactElement {

  const [transcribedAudio, setTranscribedAudio] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const messageContent = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
  const audioMessage = message.message?.audioMessage as AudioMessage

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
          <>
            <audio
              controls
              src={`app://audio/${message.key.id}.ogg`}
            >
              Your browser does not support the audio element.
            </audio>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (isTranscribing) return
                setIsTranscribing(true)
                try {
                  console.log('getting transcript from:', `app://${message.key.id}.ogg`, audioMessage)
                  const result = await window.electronAPI.transcribeAudio(`app://audio/${message.key.id}.ogg`)
                  console.log('Transcription:', result)
                  setTranscribedAudio(result)
                } catch (error) {
                  console.error('Error transcribing audio:', error)
                  alert('Error transcribing audio. Check console for details.')
                } finally {
                  setIsTranscribing(false)
                }
              }}
              className={`text-xs ${isTranscribing ? 'animate-pulse' : ''}`}
              disabled={isTranscribing}
            >
              <Mic className={`h-3 w-3 mr-1 ${isTranscribing ? 'animate-pulse' : ''}`} />
              <p>
                {isTranscribing ? 'Transcribing...' : 'Transcribe'}
              </p>
            </Button>
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
