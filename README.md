# homebridge-icy
Homebridge plugin for ICY (aka E-thermostaat)
# Configure
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