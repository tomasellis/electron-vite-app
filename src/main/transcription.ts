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
        const actualPath = audioFilePath.startsWith('app://')
            ? path.join(app.getPath('userData'), 'userData', audioFilePath.replace('app://', ''))
            : audioFilePath

        if (!fs.existsSync(actualPath)) {
            throw new Error(`Audio file not found at path: ${actualPath}`)
        }

        const audioStream = fs.createReadStream(actualPath)

        const response = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            language: 'es'
        })

        return response.text !== '' ? response.text : 'No possible transcription.'
    } catch (error) {
        console.error('Error transcribing audio:', error)
        throw error
    }
}