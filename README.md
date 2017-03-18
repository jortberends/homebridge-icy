# homebridge-icy
[Homebridge](https://github.com/nfarina/homebridge) plugin for the [Essent E-Thermostat](https://www.e-thermostaat.nl/), also known as ICY.

Plugin voor de [Essent E-Thermostaat](https://www.e-thermostaat.nl/), ook bekend als ICY.

## Install plugin
```
npm install -g jortberends/homebridge-icy
```
## Configure homebridge
Add this to your homebridge configuration:
```
    "accessories": [
	     {
            "accessory": "ICY",
            "name": "ICY",
            "apiroute": "https://portal.icy.nl",
            "username": "",
            "password": ""
        }
    ]
```