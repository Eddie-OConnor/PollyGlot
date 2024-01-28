// config.js

import OpenAI from 'openai';

async function fetchKeys(){
    try {
        const response = await fetch('TBD')
        if(response.ok){
            const data = await response.json()
            const {openaiApiKey} = data
            return {
                openaiApiKey: openaiApiKey,
            }
        } else {
            console.error('error fetching keys', response.statusText)
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
