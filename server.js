// server.js

import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

app.get('/keys', (req, res) => {
    try {
        const openaiApiKey = process.env.OPENAI_API_KEY

        res.json({openaiApiKey})
    } catch (e) {
        console.error('error fetching api key', error)
        res.status(500).json({error: 'internal server error'})
    }
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})