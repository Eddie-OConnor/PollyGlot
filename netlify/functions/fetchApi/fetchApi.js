// netlify\functions\fetchApi\fetchApi.js

import OpenAI from 'openai';

/* OpenAI config */
if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key is missing or invalid.");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (event) => {
    try {
        const {action, text, language, speech} = JSON.parse(event.body)
        if (action === 'translate'){
            const response = await translate(text, language)
            return {
                statusCode: 200,
                body: JSON.stringify({response}),
            }
        } else if (action === 'speak'){
            const base64Encoded = await textToSpeech(text)
            return {
                statusCode: 200,
                body: JSON.stringify({content: base64Encoded}),
            }
        } else if (action === 'transcribe'){
            const response = await speechToText(speech)
            return {
                statusCode: 200,
                body:JSON.stringify({response})
            }
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}


async function translate(text, language){
    const messages = [
        {
            role: 'system',
            content: `You translate ${text} from it's language into ${language}.`
        },
        {
            role: 'user',
            content: `${text}
            `
        }
    ]
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            temperature: 1,
            max_tokens: 200
        })
        const translationResponse = response.choices[0].message.content
        return translationResponse
    } catch (e) {
        console.error('Unable to access OpenAI, please refresh and try again', e)
    }
}


async function textToSpeech(text){
    try {
        const response = await openai.audio.speech.create({
            model: 'tts-1-hd',
            voice: 'echo',
            input: text
        })
        const arrayBuffer = await response.arrayBuffer()
        const base64Encoded = Buffer.from(arrayBuffer, 'base64').toString('base64')
        return base64Encoded
    } catch (e) {
        console.error('error converting translated text into speech', e)
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
      
    
module.exports = { handler }