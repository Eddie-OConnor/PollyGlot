//index.js
const textToTranslateInput = document.getElementById('translation-input')
const selectLanguage = document.getElementById('language')
const translateBtn = document.getElementById('translate-btn')
const resetBtn = document.getElementById("reset-btn")
const loading = document.getElementById('load-graphic')

translateBtn.addEventListener('click', async function(e) {
    e.preventDefault()
    const textToTranslate = textToTranslateInput.value
    const selectedLanguage = selectLanguage.value
    textToTranslateInput.disabled = true
    main(textToTranslate, selectedLanguage)
})

async function main(text, language){
    loading.classList.remove('hidden')
    const translation = await getTranslation(text, language)
    await getSpeech(translation)
    await renderTranslation(translation)
    loading.classList.add('hidden')
}

async function getTranslation(text, language){
    try {
        const response = await fetch('/.netlify/functions/fetchTranslation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text, language
            })
        })
        if(response.ok){
            const data = await response.json()
            const translation = data.response
            return translation
        }
    } catch (e){
        console.error('error fetching translation', e)
    }
}


async function getSpeech(text) {
    const translationAudio = document.getElementById('translation-audio')
    const playTranslationBtn = document.getElementById('play-translation-btn')
    try {
        const response = await fetch('/.netlify/functions/fetchSpeech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text
            })
        })
        if (response.ok) {
            const data = await response.json()
            const encoded = data.content
            const byteCharacters = atob(encoded)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++){
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], {type: 'audio/mp3'})
            translationAudio.src = URL.createObjectURL(blob)
            translationAudio.load()
            playTranslationBtn.disabled = false
            playTranslationBtn.addEventListener('click', () => {
                translationAudio.play()
            })
        }
    } catch (e) {
        console.error('error fetching audio of translation', e)
    }
}


const recordBtn = document.getElementById('record-btn')
const timeRemainingElement = document.getElementById('time-remaining');
const recordingTimeLimit = '5' /* adjust to allow longer recordings */

let recorder
let audioChunks = []
let recording = false
let countdownInterval

recordBtn.addEventListener('click', async function(){
    if(!recording){
        await startRecording()
    } else {
        await stopRecording()
    }
})

async function startRecording() {
    recording = true
    timeRemainingElement.textContent = `:0${recordingTimeLimit}`
    timeRemainingElement.classList.remove('hidden')
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false, mimeType: 'audio/mp4' });
        recorder = new MediaRecorder(stream);
        audioChunks = [];

        recorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data)
        });
        recorder.start();
        recordBtn.classList.add('recording')
        countdownTimer()

    } catch (e) {
        console.error('Error accessing microphone or recording', e)
    }
}


async function stopRecording() {
    recording = false
    clearInterval(countdownInterval)
    recordBtn.classList.remove('recording')
    timeRemainingElement.classList.add('hidden')
    loading.classList.remove('hidden')
    recorder.stop()

    return new Promise(async (resolve, reject) => {
        recorder.addEventListener('stop', async function(){
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp4' })
            const base64File = await convertAudioToBase64(audioBlob)

            try {
                const transcription = await getText(base64File)
                textToTranslateInput.innerText = transcription
                loading.classList.add('hidden')
                updateCharCount(transcription)
                resolve(transcription)
            } catch (e) {
                console.error('Error transcribing directly from recording', e)
                reject(e);
            }
        });
    });
}

async function getText(speech){
    try {
        const response = await fetch('/.netlify/functions/fetchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                speech
            })
        })
        if(response.ok){
            const data = await response.json()
            return data.response
        }
    } catch (e){
        console.error('error fetching transcribed speech', e)
    }
}


/* Utility Functions */

async function convertAudioToBase64(audioBlob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1]
            resolve(base64Data)
        }
        reader.onerror = (error) => {
            reject(error);
        }
        reader.readAsDataURL(audioBlob)
    })
}


async function renderTranslation(output){
        const textToTranslateHeader = document.getElementById("text-input-header")
        const translationFinal = document.getElementById('translation')
        translationFinal.innerHTML = output
        textToTranslateHeader.innerText = 'Original Text 👇'
        translateBtn.style.display = 'none'
        resetBtn.classList.toggle('hidden')
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


function countdownTimer() {
    let seconds = 4;

    countdownInterval = setInterval(function () {
        timeRemainingElement.textContent = `:0${seconds}`
        seconds--

        if (seconds === -1) {
            stopRecording().then((transcription) => {
                textToTranslateInput.innerText = transcription
                updateCharCount(transcription)
            }).catch((error) => {
                console.error('Error during recording or transcription', error)
            })
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


resetBtn.addEventListener('click', () => {
    location.reload()
})