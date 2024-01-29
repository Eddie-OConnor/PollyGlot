//index.js

import {initializeApiInstances} from './config.js'
const {openai} = await initializeApiInstances()

const selectLanguage = document.getElementById('language')
const translateBtn = document.getElementById('translate-btn')
const startOverBtn = document.getElementById("start-over-btn")
const textToTranslateInput = document.getElementById('translation-input')

translateBtn.addEventListener('click', async function(e) {
    e.preventDefault()
    const textToTranslate = textToTranslateInput.value
    const selectedLanguage = selectLanguage.value
    textToTranslateInput.disabled = true
    main(textToTranslate, selectedLanguage)
})

async function main(text, language){
    const translation = await translate(text, language)
    const spokenTranslation = await speakTranslation(translation)
    console.log(spokenTranslation)
    renderTranslation(translation)
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

async function speakTranslation(text){
    try {
        const response = await openai.audio.speech.create({
            model: 'tts-1-hd',
            voice: 'echo',
            input: `${text}`
        })
        return response
    } catch (e) {
        console.error('error converting translated text into speech', e)
    }
}

/* UX Functions */

function renderTranslation(output){
        const textToTranslateHeader = document.getElementById("text-to-translate")
        const originalTextHeader = document.getElementById("original-text")
        const translationFinal = document.getElementById('translation')
        translationFinal.innerHTML = output
        textToTranslateHeader.style.display = 'none'
        originalTextHeader.classList.toggle('hidden')
        translateBtn.style.display = 'none'
        startOverBtn.classList.toggle('hidden')
}

function updateCharCount(){
    const charCount = document.getElementById('char-count')
    textToTranslateInput.addEventListener('input', function(){
        const currentLength = textToTranslateInput.value.length
        charCount.textContent = `${currentLength}/100`
    })
}

updateCharCount();

function enableTranslateBtn() {
    const isTextEntered = textToTranslateInput.value.trim().length > 0
    const isLanguageSelected = selectLanguage.value !== 'default'
    translateBtn.disabled = !(isTextEntered && isLanguageSelected)
}

selectLanguage.addEventListener('input', () => enableTranslateBtn());
textToTranslateInput.addEventListener('input', () => enableTranslateBtn());


startOverBtn.addEventListener('click', () => {
    location.reload()
})