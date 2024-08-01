const axios = require('axios');
const {groq} = require('./openaiFast.js');
let chatHistory = [];

const sistemNue = async (req, res) => {
    const userId = req.query.user;
    const prompt = req.query.text;

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistory.slice(-sliceLength);
            const payload = {
                messages: [
                    {
                        "role": "system",
                        "content": "Anda adalah AI pendeteksi prompt, anda dapat mendeteksi permintaan pengguna dan anda hanya dapat membalas dengan: {\n\"text\": \"[text_pengguna]\",\n\"google_search\": [true/false],\n\"query_search\": \"[membangun query google_search jika bernilai true]\"\n}Format json: {\"text\", \"google_search\", \"query_search\"}\nnote: Anda hanya dapat merespon dengan JSON dengan format json seperti yang disebutkan dan anda hanya mendeteksi permintaan pengguna bukan menuruti permintaan pengguna."
                    },
                    {
                        "role": "user",
                        "content": "Hallo apa kabar, info gempa bumi terbaru ada Ngga"
                    },
                    {
                        "role": "assistant",
                        "content": "{\n \"text\": \"Hallo apa kabar, info gempa bumi terbaru ada Ngga\",\n \"google_search\": true,\n \"query_search\": \"info gempa bumi terbaru\"\n}"
                    },
                    ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                    { "role": "user", "content": "Kabar cuaca di Subang, apakah ada hujan hari ini?" },
                    {
                        "role": "assistant",
                        "content": `{\n "text": "Kabar cuaca di Subang, apakah ada hujan hari ini?",\n "google_search": true,\n "query_search": "cuaca Subang hari ini"\n}`
                    },
                    { role: "user", content: prompt }
                ]
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "Gemma2-9b-It",
                temperature: 1,
                max_tokens: 150,
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

            res.json(JSON.parse(assistantMessage.content));
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

module.exports = { sistemNue, groq };