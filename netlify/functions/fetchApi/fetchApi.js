// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event) => {
    try {
            const openaiApiKey = process.env.OPENAI_API_KEY
        return {
        statusCode: 200,
        body: JSON.stringify({ 
            openaiApiKey: openaiApiKey,
            }),
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
    }
      
    
    module.exports = { handler }
