const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/docs', async (req, res) => {
    try {
        const response = await axios.get('https://nue-api.koyeb.app/read');
        const data = {today:response.data.today, yesterday:response.data.yesterday,all:response.data.total};
        res.render('dashboard', { jsonData: data });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/error', function (req, res) {
  res.status(500).render('error');
});

router.get('/googlee023af832ca272f7.html', (req, res) => {
res.render('googlee023af832ca272f7');
});

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/menu', (req, res) => {
  res.render('menu');
});


module.exports = router;
