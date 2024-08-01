//middlaware 
const express = require('express');
const router = require('./router.js');
const v1 = require('./fitur/api.js');
const path = require('path');
const axios = require('axios');
const { sistemNue } = require('./fitur/func/nuego.js');

const app = express();
app.use('/', router);
app.use('/api', async (req, res, next) => {
  const apiUrl = 'https://nue-api.koyeb.app/count';
  try {
    await axios.get(apiUrl);
    next();
  } catch (error) {
    next(error);
  }
});
app.use('/api', v1);
app.set('views', path.join(path.dirname(__filename), 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);

app.get('/sistem', async (req, res) =>{
  sistemNue(req, res);
});

app.get('/generate', async (req, res) => {
  let key = []
  try {
   const response = await axios.get('https://copper-ambiguous-velvet.glitch.me/read/nuekey');
    key = response.data;
  } catch (e) {
    key = []
  }
  const angka_dan_huruf_acak_A_Z_dan_1_9 = Math.random().toString(36).substring(2, 10);
  key.push(angka_dan_huruf_acak_A_Z_dan_1_9)

  if (key.length > 5) {
    key = key.slice(-5);
  }
  await axios.post('https://copper-ambiguous-velvet.glitch.me/write/nuekey',{json: key})
res.status(200).send(angka_dan_huruf_acak_A_Z_dan_1_9);
});
app.get('/key', (req, res) =>{
  res.redirect('https://copper-ambiguous-velvet.glitch.me/read/nuekey')
});
app.get("/redirect", async (req, res) =>{
  if (!req.query.re) return res.send("Invalid Url");
  res.redirect(req.query.re);
});
app.get("/uptime", async (req, res) => {
  const chatAi = 'https://copper-ambiguous-velvet.glitch.me/';
  const Scraper = 'https://dour-glory-nectarine.glitch.me/';
 const sideSrv = 'https://nue-api.koyeb.app/'


  try {
    const [chatRes, scrapRes, sideRes] = await Promise.all([
      axios.get(chatAi),
      axios.get(Scraper),
      axios.get(sideSrv)
    ]);

    res.send(`DB Uptime: ${chatRes.status} | Scraper Uptime: ${scrapRes.status} | Side Uptime: ${sideRes.status}`);
  } catch (error) {
    res.send("Error fetching uptime information");
  }
});

app.listen(3000, function() {
  console.log('Server berjalan di port 3000');
});
