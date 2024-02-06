// netlify\functions\fetchText\fetchText.js

// import OpenAI from 'openai';

// /* OpenAI config */
// if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key is missing or invalid.");
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

import {openai} from '../../../openai.config.js'

const handler = async (event) => {
    try {
        const { speech } = JSON.parse(event.body)
        const response = await speechToText(speech)
        return {
            statusCode: 200,
            body: JSON.stringify({ response })
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

async function speechToText(speech){
    const byteCharacters = atob(speech)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++){
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'audio/mp4' })
    const audioFile = new File([blob], 'audio.mp4', {type: 'audio/mp4'})
    try {
        const response = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            response_format: 'text'
        })
        return response
    } catch(e){
        console.error('error transcribing the user recording', e)
    }
}
      
    
export { handler }