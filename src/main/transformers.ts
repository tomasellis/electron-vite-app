// This file (model.js) contains all the logic for loading the model and running predictions.

import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { WaveFile } from 'wavefile'

class MyClassificationPipeline {
    // NOTE: Replace this with your own task and model
    static task = 'automatic-speech-recognition' as const;
    static model = 'Xenova/whisper-base';
    static instance: any = null;

    static async getInstance(progress_callback?: (progress: number) => void) {
        if (this.instance === null) {
            // Dynamically import the Transformers.js library
            let { pipeline, env } = await import('@xenova/transformers');

            // NOTE: Uncomment this to change the cache directory
            // env.cacheDir = './.cache';

            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                // @ts-ignore - These options are valid for Whisper but not in the type definitions
                chunk_length_s: 30, // Process in 30-second chunks
                stride_length_s: 5,  // 5-second overlap between chunks
            });
        }

        return this.instance;
    }
}

// The run function is used by the `transformers:run` event handler.
async function run(event, audioPath: string) {
    console.log('Path to audio:', audioPath);

    // Convert app:// protocol path to actual file path in the Electron app's resources
    const actualPath = audioPath.replace('app://audio/', path.join(app.getPath('userData'), 'audio/'));
    console.log('Actual file path:', actualPath);

    try {
        // Read the audio file
        const buffer = fs.readFileSync(actualPath);

        // Convert to WaveFile format
        const wav = new WaveFile(buffer);

        // Convert to the format expected by Whisper (32-bit float)
        wav.toSampleRate(16000); // Whisper expects 16kHz
        wav.toBitDepth('32f'); // Convert to 32-bit float

        // Get the audio data as Float32Array
        const audioData = wav.getSamples();

        // Get the transcriber instance
        const transcriber = await MyClassificationPipeline.getInstance();

        // Transcribe the audio data
        const result = await transcriber(audioData, {
            language: 'spanish', // Set language to Spanish
            task: 'transcribe', // Task is transcription
            return_timestamps: true // Optional: include timestamps for chunks
        });
        console.log('Transcription result:', result);

        // Combine all chunks into a single text
        const combinedText = result
            .map(chunk => chunk.text.trim())
            .filter(text => text) // Remove empty strings
            .join(' ');

        return combinedText;
    } catch (error) {
        console.error('Error in transcription:', error);
        throw error;
    }
}

export { run }