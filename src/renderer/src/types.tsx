
export interface Chat {
    id: number
    name: string
    message: string
    time: string
    avatar: string
    tag?: string
    isTyping?: boolean
    isUnread?: boolean
    isSilenced?: boolean
    isActive?: boolean
    hasVoiceMessage?: boolean
    isRead?: boolean
}