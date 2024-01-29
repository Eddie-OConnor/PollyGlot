// netlify\functions\fetchApi\fetchApi.js

const handler = async (event) => {
    try {
            const openaiApiKey = process.env.OPENAI_API_KEY
        return {
        statusCode: 200,
        body: JSON.stringify({ 
            openaiApiKey: openaiApiKey,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Or your specific domain
              },          
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
    }
      
    
    module.exports = { handler }
