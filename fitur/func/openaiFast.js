const Groq = require('groq-sdk');
const axios = require('axios');

const key = ['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','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','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','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']
const randomKey = key[Math.floor(Math.random() * key.length)];
const groq = new Groq({ apiKey: randomKey });
let chatHistory = [];

const handleChat = async (req, res, systemMessage) => {
    const userId = req.query.user;
    const prompt = req.query.text;
    systemMessage = systemMessage || req.query.systemPrompt;
    const aiMessage = req.query.aiMessage;

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistory.slice(-sliceLength);
            const payload = {
                messages: [
                    { role: "system", content: systemMessage },
                    ...messages.map(msg => ({ role: msg.role, content: msg.content })),
  { role: "user", content: prompt },
                    aiMessage ? { role: "system", content: aiMessage } : null
                ].filter(Boolean)
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "llama3-70b-8192",
                temperature: 1,
                max_tokens: 500,
                top_p: 1,
                stream: false,
                stop: null
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
            chatHistory.push({ role: "user", content: prompt }, assistantMessage);

            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
            assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

            await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
                json: { [userId]: chatHistory }
            });

            res.json({ result: assistantMessage.content, history: `https://copper-ambiguous-velvet.glitch.me/read/${userId}` });
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        let readResponse = { data: {} };
        try {
            readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        } catch (error) {
            await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, { json: { [userId]: [] } });
            readResponse.data = {};
        }
        chatHistory = readResponse.data[userId] || [];

        let success = await sendRequest(20);
        if (!success) success = await sendRequest(15);
        if (!success) success = await sendRequest(10);
        if (!success) success = await sendRequest(5);
        if (!success) {
            chatHistory = [];
            success = await sendRequest(0);
        }
        if (!success) throw new Error('All retries failed');
    } catch (error) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
            json: { [userId]: [] }
        });
        console.error('Error request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { handleChat, groq };