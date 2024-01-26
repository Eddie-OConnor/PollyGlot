import OpenAI from "openai"

const translateBtn = document.getElementById("translate-btn")

translateBtn.addEventListener('click', () => {
    const textToTranslate = document.getElementById('text-input').value
    const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
    translate(textToTranslate, selectedLanguage)
    document.getElementById('text-input').disabled = true
})

async function translate(textToTranslate, selectedLanguage){
    const messages = [
        {
            role: 'system',
            content: `You translate ${textToTranslate} from English into ${selectedLanguage}.`
        },
        {
            role: 'user',
            content: `${textToTranslate}
            `
        }
    ]
    try {
        const openai = new OpenAI ({
            dangerouslyAllowBrowser: true
        })
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            temperature: 1,
            max_tokens: 200
        })
        const translationResponse = response.choices[0].message.content
        console.log(translationResponse)
        console.log(response)
        renderTranslation(translationResponse)
    } catch (err) {
        console.log('Error:', err)
        console.log('Unable to access OpenAI, please refresh and try again')
    }
}

const textToTranslateHeader = document.getElementById("text-to-translate")
const originalTextHeader = document.getElementById("original-text")
const translatedText = document.getElementById("translation-div")
const selectLanguageDiv = document.getElementById("select-language")
const startOverBtn = document.getElementById("start-over-btn")
const startOverBtnContainer = document.getElementById('start-over-btn-container') 

function renderTranslation(output){
        const translation = document.getElementById('translation')
        translation.innerHTML = output
        translatedText.classList.toggle('hidden')
        textToTranslateHeader.style.display = 'none'
        originalTextHeader.classList.toggle('hidden')
        translateBtn.style.display = 'none'
        selectLanguageDiv.style.display = 'none'
        startOverBtnContainer.classList.toggle('hidden')
}

const textToTranslate = document.getElementById('text-input')
const charCount = document.getElementById('char-count')

textToTranslate.addEventListener('input', () => {
    const currentLength = textToTranslate.value.length
    const maxLength = parseInt(textToTranslate.getAttribute('maxlength'))
    
    if (currentLength > maxLength) {
        textToTranslate.value = textToTranslate.value.substring(0, maxLength)
    }
    charCount.textContent = `${currentLength}/${maxLength}`
})

const languageInputs = document.querySelectorAll('input[name="language"]')

function enableTranslateBtn() {
    const isTextEntered = textToTranslate.value.trim().length > 0
    const isLanguageSelected = Array.from(languageInputs).some(input => input.checked)

    if (isTextEntered && isLanguageSelected) {
        translateBtn.disabled = false;
    } else {
        translateBtn.disabled = true;
    }
}

textToTranslate.addEventListener('input', enableTranslateBtn)
languageInputs.forEach(input => input.addEventListener ('change', enableTranslateBtn))

startOverBtn.addEventListener('click', () => {
    location.reload()
})