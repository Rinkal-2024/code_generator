const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 8000;
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(cors({
    origin:'https://generativeai-nine.vercel.app',
}));
app.use(bodyParser.json());

app.post('/generate-code', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([prompt]);

        // console.log('API Response:', JSON.stringify(result, null, 2));
        console.log('API Response:', JSON.stringify(result));

        
        if (result.response && result.response.candidates && result.response.candidates.length > 0) {
            const generatedContent = result.response.candidates[0];
            const generatedText = generatedContent.content.parts[0].text; 

            const codeOnly = generatedText.split('**Explanation:**')[0].trim(); // Split and take the first part
            const cleanedCode = codeOnly.replace(/```python|```|```javascript/g, '').trim(); // Clean up code formatting

            return res.json({ code: cleanedCode });
        }
        
        return res.status(500).json({ error: 'No valid candidates returned' });
    } catch (error) {
        console.error('Error generating code:', error);
        return res.status(500).json({ error: 'Failed to generate code' });
    }
});

app.get('/' ,(req,res)=>{
    res.send('Hello World')
    console.log(genAI.getGenerativeModel({ model: "gemini-1.5-flash" }));
    res.send(genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(["Generate a Python function to print 'Hello, World!'"]));
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(process.env.API_KEY ,"===>")
});