const axios = require('axios');

const get = async (text, user) => {
    const gpt = async (text, username, idnya) => {
        const payload = {
            app: { id: idnya, time: Date.now(), data: { sender: { id: username }, message: [{ id: Date.now(), time: Date.now(), type: "text", value: text }] } }
        };

        const webhookUrl = 'https://webhook.botika.online/webhook/';
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer s9561k-znra-c37c54x8qxao0vox-nwm9g4tnrm-dp3brfv8" };

        try {
            const { data, status } = await axios.post(webhookUrl, payload, { headers });

            if (status === 200 && data.app?.data?.message) {
                let replyMessage = data.app.data.message.map(message => message.value).join('\n');
                if (/(<BR>|<br>)/i.test(replyMessage)) {
                    return replyMessage.replace(/<BR>|<br>/gi, '\n').replace(/```/g, '\n').split('\n').map(message => `\n\n${message}\n`).join('');
                } else {
                    return replyMessage;
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }

        return "Aku tidak mengerti";
    };

    let hasil = await gpt(text, user+'v1', "blaael9y3cu1706606677060");
    for (let i = 0; i < 3 && hasil === "Maaf, aku belum mengerti dengan pertanyaanmu. Bisa kamu menjelaskannya lagi?"; i++) {
        hasil = await gpt(text, user+'v1', "blaael9y3cu1706606677060");
    }
  const response = await axios.get(`https://nue-api.vercel.app/api/gpt?model=gpt-4&prompt=Tambahkan emoji pada teks yang saya berikan menggunakan emoji ekspresi di setiap frasa/kata nya

teks : ${hasil}
  
Note : hanya berikan teks yang sudah di modifikasi!!`);

  return response.data.result.gpt
};
module.exports = { get };