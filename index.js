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
    const playTranslationBtn = document.getElementById('play-translation-btn')
    try {
        const response = await openai.audio.speech.create({
            model: 'tts-1-hd',
            voice: 'echo',
            input: text
            // update these back ticks?
        })
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob ([arrayBuffer], {type: 'audio/mp3'})
        playTranslationBtn.src = URL.createObjectURL(blob)
        playTranslationBtn.load()
    } catch (e) {
        console.error('error converting translated text into speech', e)
    }
}

recordButton.addEventListener('click', async function(){
    const recording = await recordMessage()
    const transcript = await speechToText(recording)
    textToTranslateInput.innerText = transcript
})

async function recordMessage() {
    let audioChunks = [];

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
            const filename = 'audio.wav'
            const file = new File([audioBlob], filename, {type: 'audio/wav'})
            console.log(file)
            return file
        };
        mediaRecorder.start();
        setTimeout(function () {
            mediaRecorder.stop();
            // stream.getTracks().forEach(track => track.stop());
        }, 2000);
        return await new Promise((resolve, reject) => {
            mediaRecorder.onstop = resolve;
        })
    } catch (e) {
        console.error('Error accessing microphone or recording', e);
    }
}


async function speechToText(speech){
    try {
        const response = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: speech,
            response_format: 'text'
        })
        return response.text
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