import { Check, CheckCheck, Mic, Play, Pause } from 'lucide-react'
import { AudioMessage, IncomingMessage } from '../../types'
import { ReactElement, useState, useRef } from 'react'
import { Button } from './button'

interface MessageBubbleProps {
  message: IncomingMessage
  isOwn?: boolean
}

export function MessageBubble({ message, isOwn = false }: MessageBubbleProps): ReactElement {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const messageContent = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
  const audioMessage = message.message?.audioMessage as AudioMessage
  const transcribedAudio = audioMessage?.transcribedText

  const timestamp = message.messageTimestamp
    ? new Date(Number(message.messageTimestamp) * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    : ''

  const isRead = message.status === 4
  const isDelivered = message.status === 3

  const generateWaveform = (length = 40): Uint8Array => {
    return new Uint8Array(Array.from({ length }, () => Math.floor(Math.random() * 0.8 * 255 + 0.2 * 255)))
  }

  const lastWaveform = generateWaveform()





  console.log('MESSAGE>>>>>', audioMessage, transcribedAudio)
  const selfMsgBg = "rgb(20,77,55)"
  const otherMsgBg = "rgb(36,38,38)"
  return (
    <div className={`flex w-full my-1 ${isOwn ? 'justify-end pr-4' : 'justify-start pl-4'}`}>
      <div
        className='flex-col rounded-lg p-3.5 max-w-xs'
        style={{
          backgroundColor: isOwn ? selfMsgBg : otherMsgBg,
        }}
      >

        {audioMessage ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause()
                    } else {
                      audioRef.current.play()
                    }
                    setIsPlaying(!isPlaying)
                  }
                }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div
                className="flex h-8 items-center cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickPosition = e.clientX - rect.left
                    const percentage = clickPosition / rect.width
                    const newTime = percentage * (audioRef.current.duration || 0)
                    audioRef.current.currentTime = newTime
                    setCurrentTime(newTime)
                  }
                }}
              >
                {audioMessage?.waveform && Array.from(audioMessage.waveform).map((value, index) => {
                  const totalBars = audioMessage?.waveform?.length || 0
                  const currentBar = Math.floor((currentTime / (audioRef.current?.duration || 1)) * totalBars)
                  return (
                    <div
                      key={index}
                      className={`w-1 rounded-xs transition-colors ${index <= currentBar ? 'bg-green-400' : 'bg-gray-300'}`}
                      style={{
                        height: `${(value / 255) * 250}%`,
                        minHeight: '4px'
                      }}
                    />
                  )
                })}

              </div>
              <audio
                ref={audioRef}
                src={audioMessage.localPath}
                className="hidden"
                onEnded={() => {
                  setIsPlaying(false)
                  setCurrentTime(0)
                }}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime)
                  }
                }}
              />
            </div>
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
