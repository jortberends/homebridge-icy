# homebridge-icy
[Homebridge](https://github.com/nfarina/homebridge) plugin for ICY (aka E-thermostaat)
# Installation

## Install plugin
Clone this project and run this in the folder:
```
npm install -g
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