//index.js
import {initializeApiInstances} from './config.js'
const {openai} = await initializeApiInstances()

const textToTranslateInput = document.getElementById('translation-input')
const recordButton = document.getElementById('record-button')
const selectLanguage = document.getElementById('language')
const translateBtn = document.getElementById('translate-btn')
const startOverBtn = document.getElementById("start-over-btn")

async function main(text, language){
    const translation = await translate(text, language)
    await speakTranslation(translation)
    await renderTranslation(translation)
}


translateBtn.addEventListener('click', async function(e) {
    e.preventDefault()
    const textToTranslate = textToTranslateInput.value
    const selectedLanguage = selectLanguage.value
    textToTranslateInput.disabled = true
    main(textToTranslate, selectedLanguage)
})


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
    const translationAudio = document.getElementById('translation-audio')
    const playTranslationBtn = document.getElementById('play-translation-btn')
    try {
        const response = await openai.audio.speech.create({
            model: 'tts-1-hd',
            voice: 'echo',
            input: text
        })
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob ([arrayBuffer], {type: 'audio/mp3'})
        translationAudio.src = URL.createObjectURL(blob)
        translationAudio.load()
        playTranslationBtn.disabled = false
        playTranslationBtn.addEventListener("click", () => {
            translationAudio.play()
          })
    } catch (e) {
        console.error('error converting translated text into speech', e)
    }
}

recordButton.addEventListener('click', async function(){
    const transcription = await transcribeAudio()
    textToTranslateInput.innerText = transcription
    updateCharCount(transcription)
})

async function transcribeAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const recorder = new MediaRecorder(stream)
        let audioChunks = []

        recorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });
        recorder.start();
        countdownTimer(recorder)

        return new Promise(async (resolve, reject) => {
            recorder.addEventListener('stop', async function(){
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'audio.wav', {type: 'audio/wav'})
                try {
                    const transciption = await speechToText(audioFile)
                    resolve(transciption)
                } catch (e) {
                    console.error('error transcribing directly from recording')
                    reject(e)
                }
            })
        })
    } catch (e) {
        console.error('Error accessing microphone or recording', e)
    }
}


async function speechToText(speech){
    try {
        const response = await openai.audio.transcriptions.create({
            file: speech,
            model: 'whisper-1',
            response_format: 'text'
        })
        return response
    } catch(e){
        console.error('error transcribing the user recording', e)
    }
}

/* UX Functions */


async function renderTranslation(output){
        const textToTranslateHeader = document.getElementById("text-input-header")
        const translationFinal = document.getElementById('translation')
        translationFinal.innerHTML = output
        textToTranslateHeader.innerText = 'Original Text 👇'
        translateBtn.style.display = 'none'
        startOverBtn.classList.toggle('hidden')
}


function updateCharCount(transcription){
    if(transcription){
        const charCount = document.getElementById('char-count')
        const currentLength = transcription.length
        charCount.textContent = `${currentLength}/100`
    } else {
        const charCount = document.getElementById('char-count')
        textToTranslateInput.addEventListener('input', function(){
            const currentLength = textToTranslateInput.value.length
            charCount.textContent = `${currentLength}/100`
        })
    }
}

updateCharCount()


function countdownTimer(recorder) {
    let seconds = 9
    const timeRemainingElement = document.getElementById('time-remaining')

    recordButton.disabled = true

    const countdownInterval = setInterval(function () {
        timeRemainingElement.textContent = `:0${seconds}`
        seconds--

        if (seconds < -1) {
            clearInterval(countdownInterval)
            recordButton.disabled = false
            timeRemainingElement.textContent = ''
            recorder.stop()
        }
    }, 1000)
}


function enableTranslateBtn() {
    const isTextEntered = textToTranslateInput.value.trim().length > 0
    const isLanguageSelected = selectLanguage.value !== 'default'
    translateBtn.disabled = !(isTextEntered && isLanguageSelected)
}

selectLanguage.addEventListener('input', () => enableTranslateBtn())
textToTranslateInput.addEventListener('input', () => enableTranslateBtn())


startOverBtn.addEventListener('click', () => {
    location.reload()
})