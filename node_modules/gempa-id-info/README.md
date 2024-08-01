# gempa-id-info

## Basic Code:

```js

let bmkg_info = require('gempa-id-info')


bmkg_info.latestGempa().then(data => {
    console.log(data) // Returns JSON
})

bmkg_info.listOfTopFifteenGempa().then(data => {
    console.log(data) // Returns JSON
})

bmkg_info.covidCountIndonesia().then(data => {
    console.log(data) // Returns JSON
})
```

#### [Github Repository](https://github.com/dep-5260/gempa-id-info)
#### [Bugs or Issues](https://github.com/dep-5260/gempa-id-info/issues)
#### [Update Log](https://github.com/dep-5260/gempa-id-info/blob/main/UPDATELOG.md)
#### [Donasi aku disini lewat Saweria](https://saweria.co/depdev)
#### [Join our discord server here](https://discord.gg/zddRvUuQ28)