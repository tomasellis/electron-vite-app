import fs from 'fs'
import OpenAI from 'openai'
import { app } from 'electron'
import path from 'path'
import 'dotenv/config'


// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function transcribeAudio(audioFilePath: string): Promise<string> {
    try {
        // Convert app:// protocol to actual file path in user data directory
        const actualPath = audioFilePath.startsWith('app://')
            ? path.join(app.getPath('userData'), audioFilePath.replace('app://', ''))
            : audioFilePath

        // Ensure the file exists
        if (!fs.existsSync(actualPath)) {
            throw new Error(`Audio file not found at path: ${actualPath}`)
        }

        // Create a read stream from the audio file
        const audioStream = fs.createReadStream(actualPath)

        // Call OpenAI's Whisper API
        const response = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            language: 'es'
        })

        return response.text
    } catch (error) {
        console.error('Error transcribing audio:', error)
        throw error
    }
}