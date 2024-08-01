let fetch = require('node-fetch');

function latestGempa() {
    return fetch(`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`).then(res => {
        if(res.status === 200) {
            return fetch(`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`).then(n=>n.json()).then(body => {
                body.Infogempa.gempa.Shakemap = {data: body.Infogempa.gempa.Shakemap,url: `https://data.bmkg.go.id/DataMKG/TEWS/${body.Infogempa.gempa.Shakemap}`}
                return body.Infogempa.gempa
            })
        } else {
            throw new Error('Unable to fetch BMKG.GO.ID')
        }
    })
};

function listLastGempa() {
    return fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json').then(res => {
        if(res.status === 200) {
            return fetch(`https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`).then(n=>n.json()).then(body => {
                return body.Infogempa.gempa
            })
        } else {
            throw new Error('Unable to fetch BMKG.GO.ID')
        }
    })
};

function covidCountRI() {
    return fetch(`https://covid19.mathdro.id/api/countries/indonesia`).then(res => {
        if(res.status === 200) {
            return fetch(`https://covid19.mathdro.id/api/countries/indonesia`).then(n=>n.json()).then(body => {
                return body
            })
        } else {
            throw new Error('Unable to fetch Covid19 API Stats. Retry again later.')
        }
    })
};

module.exports = {
    latestGempa: latestGempa,
    listOfTopFifteenGempa: listLastGempa,
    covidCountIndonesia: covidCountRI,
    version: '1.0.5'
}