

async function transcribeAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false, mimeType: 'audio/mp4' });
        const recorder = new MediaRecorder(stream)
        let audioChunks = []

        recorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });
        recorder.start();
        recordButton.classList.add('recording')
        countdownTimer(recorder)

        return new Promise(async (resolve, reject) => {
            recorder.addEventListener('stop', async function(){
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });
                const audioFile = new File([audioBlob], 'audio.mp4', {type: 'audio/mp4'})
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