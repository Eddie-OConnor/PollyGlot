//index.js
const textToTranslateInput = document.getElementById('translation-input')
const recordButton = document.getElementById('record-button')
const selectLanguage = document.getElementById('language')
const translateBtn = document.getElementById('translate-btn')
const startOverBtn = document.getElementById("start-over-btn")
const loading = document.getElementById('load-graphic')

translateBtn.addEventListener('click', async function(e) {
    e.preventDefault()
    const textToTranslate = textToTranslateInput.value
    const selectedLanguage = selectLanguage.value
    textToTranslateInput.disabled = true
    let action = 'translate'
    main(textToTranslate, selectedLanguage, action)
})

async function main(text, language, action){
    const translation = await getTranslation(text, language, action)
    await getSpeech(translation, action)
    await renderTranslation(translation)
}

async function getTranslation(text, language, action){
    try {
        const response = await fetch('/.netlify/functions/fetchApi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text, language, action
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


async function getSpeech(text, action) {
    const translationAudio = document.getElementById('translation-audio')
    const playTranslationBtn = document.getElementById('play-translation-btn')
    action = 'speak'
    try {
        const response = await fetch('/.netlify/functions/fetchApi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mp3'
            },
            body: JSON.stringify({
                text, action
            })
        })
        if (response.ok) {
            const data = await response.json()
            console.log(data)
            // const blob = data.blob
            // translationAudio.src = URL.createObjectURL(blob)
            // translationAudio.load()
            // playTranslationBtn.disabled = false
            // playTranslationBtn.addEventListener('click', () => {
            //     translationAudio.play()
            // })
        }
    } catch (e) {
        console.error('error fetching translation', e)
    }
}

recordButton.addEventListener('click', async function(){
    const transcription = await transcribeAudio()
    textToTranslateInput.innerText = transcription
    updateCharCount(transcription)
})


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

updateCharCount()


function countdownTimer(recorder) {
    let seconds = 6
    const timeRemainingElement = document.getElementById('time-remaining')

    // recordButton.disabled = true
    
    const countdownInterval = setInterval(function () {
        timeRemainingElement.textContent = `:0${seconds}`
        seconds--

        if (seconds < -1) {
            clearInterval(countdownInterval)
            recordButton.classList.remove('recording')
            timeRemainingElement.textContent = ''
            recorder.stop()
        }
    }, 1000)
}