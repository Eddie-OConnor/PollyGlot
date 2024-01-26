// config.js

import OpenAI from 'openai';

async function fetchKeys(){
    try {
        const response = await fetch('http://localhost:4000/keys')
        if(response.ok){
            const data = await response.json()
            return data
        } else {
            console.error('error fetching api key', response.statusText)
        }
    } catch (e){
        console.error('error fetching keys', e)
  }
}

export async function initializeApiInstances(){
    try {
        const apiKeys = await fetchKeys()
        /* OpenAI config */
        if (!apiKeys.openaiApiKey) throw new Error("OpenAI API key is missing or invalid.");
        const openai = new OpenAI({
            apiKey: apiKeys.openaiApiKey,
            dangerouslyAllowBrowser: true
        });
        return {openai}
    } catch (e){
        console.error('error initializing instances', e)
    }
}
