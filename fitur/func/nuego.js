const axios = require('axios');
const {groq} = require('./openaiFast.js');
let chatHistory = [];

const sistemNue = async (req, res) => {
    const userId = 'sistem';
    const prompt = req.query.text;

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistory.slice(-sliceLength);
            const payload = {
                messages: [
                    {
                        "role": "system",
                        "content": "Anda adalah AI pendeteksi prompt. Tugas Anda adalah mendeteksi permintaan pengguna dan membalasnya dengan format JSON berikut: {\n\"text\": \"[text_pengguna]\",\n\"google_search\": [true/false],\n\"query_search\": \"[query_pencarian_google_jika_google_search_bernilai_true]\"\n}. Catatan: Anda hanya boleh merespons dalam format JSON seperti yang disebutkan dan hanya mendeteksi permintaan pengguna, bukan menuruti permintaan pengguna."
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
                    { 
                        "role": "user", 
                        "content": "Kabar cuaca di Subang, apakah ada hujan hari ini?" 
                    },
                    {
                        "role": "assistant",
                        "content": `{\n \"text\": \"Kabar cuaca di Subang, apakah ada hujan hari ini?\",\n \"google_search\": true,\n \"query_search\": \"cuaca Subang hari ini\"\n}`
                    },
                    { 
                        "role": "system", 
                        "content": "Ubah nilai 'google_search' menjadi 'true' jika pertanyaan membutuhkan mesin pencari. Jika pertanyaan hanya obrolan biasa, ubah menjadi 'false'." 
                    },
                    { 
                        "role": "user", 
                        "content": prompt 
                    }
                ]
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "Gemma2-9b-It",
                temperature: 1,
                max_tokens: 1024,
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

            await axios.post(`https://nue-db.vercel.app/write/${userId}`, {
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
            readResponse = await axios.get(`https://nue-db.vercel.app/read/${userId}`);
        } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
        }
        readResponse.data = readResponse.data || {};
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
        await axios.post(`https://nue-db.vercel.app/write/${userId}`, {
            json: { [userId]: [] }
        });
        console.error('Error request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { sistemNue, groq };