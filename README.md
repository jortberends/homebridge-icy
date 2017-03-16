# homebridge-icy
Homebridge plugin for ICY (aka E-thermostaat)
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
            "maxTemp": "26",
            "minTemp": "15",
            "username": "",
            "password": ""
        }
    ]
```