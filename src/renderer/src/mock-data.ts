import { Chat, Contact, IncomingMessage } from './types'

export const mockContacts: Contact[] = [
    {
        id: '123456789@s.whatsapp.net',
        name: 'John Doe',
        notify: 'John',
        imgUrl: null
    },
    {
        id: '987654321@s.whatsapp.net',
        name: 'Jane Smith',
        notify: 'Jane',
        imgUrl: null
    },
    {
        id: '111222333@s.whatsapp.net',
        name: 'Alice Johnson',
        notify: 'Alice',
        imgUrl: null
    },
    {
        id: '444555666@s.whatsapp.net',
        name: 'Bob Wilson',
        notify: 'Bob',
        imgUrl: null
    },
    {
        id: '777888999@s.whatsapp.net',
        name: 'Carol Brown',
        notify: 'Carol',
        imgUrl: null
    },
    {
        id: '123123123@s.whatsapp.net',
        name: 'David Lee',
        notify: 'David',
        imgUrl: null
    },
    {
        id: '456456456@s.whatsapp.net',
        name: 'Emma Davis',
        notify: 'Emma',
        imgUrl: null
    },
    {
        id: '789789789@s.whatsapp.net',
        name: 'Frank Miller',
        notify: 'Frank',
        imgUrl: null
    },
    {
        id: '321321321@s.whatsapp.net',
        name: 'Grace Taylor',
        notify: 'Grace',
        imgUrl: null
    },
    {
        id: '654654654@s.whatsapp.net',
        name: 'Henry White',
        notify: 'Henry',
        imgUrl: null
    },
    {
        id: '111111111@s.whatsapp.net',
        name: 'Sophia Chen',
        notify: 'Sophia',
        imgUrl: null
    },
    {
        id: '222222222@s.whatsapp.net',
        name: 'Lucas Rodriguez',
        notify: 'Lucas',
        imgUrl: null
    },
    {
        id: '333333333@s.whatsapp.net',
        name: 'Olivia Kim',
        notify: 'Olivia',
        imgUrl: null
    },
    {
        id: '444444444@s.whatsapp.net',
        name: 'Ethan Patel',
        notify: 'Ethan',
        imgUrl: null
    },
    {
        id: '555555555@s.whatsapp.net',
        name: 'Isabella Santos',
        notify: 'Isabella',
        imgUrl: null
    },
    {
        id: '666666666@s.whatsapp.net',
        name: 'Noah Kumar',
        notify: 'Noah',
        imgUrl: null
    },
    {
        id: '777777777@s.whatsapp.net',
        name: 'Ava Martinez',
        notify: 'Ava',
        imgUrl: null
    },
    {
        id: '888888888@s.whatsapp.net',
        name: 'William Zhang',
        notify: 'Will',
        imgUrl: null
    },
    {
        id: '999999999@s.whatsapp.net',
        name: 'Mia Anderson',
        notify: 'Mia',
        imgUrl: null
    },
    {
        id: '000000000@s.whatsapp.net',
        name: 'James Okafor',
        notify: 'James',
        imgUrl: null
    },
    {
        id: 'group1@s.whatsapp.net',
        name: 'Project Team',
        notify: 'Project Team',
        imgUrl: null
    },
    {
        id: 'group2@s.whatsapp.net',
        name: 'Family Group',
        notify: 'Family',
        imgUrl: null
    },
    {
        id: 'group3@s.whatsapp.net',
        name: 'Book Club',
        notify: 'Book Club',
        imgUrl: null
    },
    {
        id: 'group4@s.whatsapp.net',
        name: 'Gaming Squad',
        notify: 'Gaming',
        imgUrl: null
    },
    {
        id: 'group5@s.whatsapp.net',
        name: 'Study Group',
        notify: 'Study',
        imgUrl: null
    }
]

export const mockChats: Chat[] = mockContacts.map(contact => ({
    id: contact.id,
    name: contact.name,
    unreadCount: Math.floor(Math.random() * 5),
    archived: false,
    pinned: Math.random() > 0.7,
    muteEndTime: Math.random() > 0.8 ? Date.now() + 86400000 : undefined
}))

const generateMockMessage = (chatId: string, isFromMe: boolean, timestamp: number): IncomingMessage => {
    const messages = [
        // Casual greetings
        "Hey, how are you?",
        "Hi there! How's it going?",
        "Hey! Long time no see",
        "Hello! How have you been?",

        // Meeting related
        "Can we meet tomorrow?",
        "Let's schedule a call",
        "The meeting is at 2 PM",
        "Are you free for a quick chat?",
        "Can we reschedule our meeting?",
        "I'll send you the meeting link",

        // Work related
        "I'll send you the files later",
        "Can you review this document?",
        "The project deadline is next week",
        "I've updated the presentation",
        "Let me know if you need any changes",
        "I'll get back to you soon",

        // Status updates
        "I'm running late, sorry",
        "Just finished the task",
        "Still working on it",
        "Almost done with the report",
        "Taking a quick break",

        // Questions
        "Did you see the latest update?",
        "What do you think about this?",
        "Can you help me with something?",
        "Do you have a minute?",
        "Have you checked the email?",

        // Responses
        "Thanks for your help!",
        "That sounds great!",
        "I'll look into it",
        "Got it, thanks!",
        "Perfect, that works for me",

        // Personal
        "How was your weekend?",
        "Did you watch the game?",
        "Happy birthday! 🎉",
        "Congratulations! 🎊",
        "Hope you're feeling better",

        // Urgent
        "Need this ASAP",
        "Can you check this now?",
        "It's quite urgent",
        "Please respond when you can",
        "Emergency meeting in 5",

        // Technical
        "The server is down",
        "Need to update the system",
        "Found a bug in the code",
        "Deployment is complete",
        "Running some tests",

        // Social
        "Are you coming to the party?",
        "Let's grab lunch sometime",
        "Did you see the new movie?",
        "How's the family?",
        "Want to catch up soon?"
    ]

    return {
        key: {
            remoteJid: chatId,
            fromMe: isFromMe,
            id: `msg-${Date.now()}-${Math.random()}`
        },
        message: {
            conversation: messages[Math.floor(Math.random() * messages.length)]
        },
        messageTimestamp: timestamp,
        status: isFromMe ? 2 : 1
    }
}

export const generateMockMessages = (): Record<string, IncomingMessage[]> => {
    const messages: Record<string, IncomingMessage[]> = {}
    const now = Math.floor(Date.now() / 1000)

    mockChats.forEach(chat => {
        const chatMessages: IncomingMessage[] = []
        // Generate 10 messages for each chat
        for (let i = 0; i < 10; i++) {
            const timestamp = now - (i * 3600) // One hour apart
            chatMessages.push(generateMockMessage(chat.id, Math.random() > 0.5, timestamp))
        }
        messages[chat.id] = chatMessages
    })

    return messages
} 