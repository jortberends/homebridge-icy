var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-icy", "ICY", ICY);
};

class ICY {
	constructor(log, config) {
		this.log = log;
		
		this.name = config.name;
		this.username = config.username;
		this.password = config.password;
		this.apiroute = config.apiroute;
		
		this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
		this.temperature = 0;
		this.targetTemperature = 0;
		this.heatingThresholdTemperature = 0;
		
		this.uid = null;
		this.token = null;
		
		this.heatingCoolingState = Characteristic.CurrentHeatingCoolingState.AUTO;
		this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
		
		this.refreshToken((error) => {
			if (error) {
// 				this.log("Error refreshing token.");
			} else {
// 				this.log("Token loaded.");
			}
		});
		
		this.service = new Service.Thermostat(this.name);		
	}
	
	refreshToken(callback) {
// 		this.log("Receiving token.");
		
		if (this.token) {
			callback(null, this.token);
		} else {			
			request.post({
				url: this.apiroute+"/login",
				form: {
					username: this.username,
					password: this.password
				}
			}, function (err, response, body) {
				if (!err && response.statusCode == 200) {
// 					this.log("Login response success");
					var json = JSON.parse(body);
					this.token = json.token; // Login token
					this.uid = json.serialthermostat1; // Thermostat serial, for setting temperature
// 					this.log("Login token retrieved: " + this.token);
					callback(null, this.token);
				} else {
					this.log(error);
					callback(err);				
				}
			}.bind(this));
		}
	}
	
	refreshThermostat(callback) {
// 		this.log("Refreshing thermostat");
		
		this.refreshToken(function (error, token) {
			if (token) {
				request.get({
					url: this.apiroute + "/data",
					form: {
						username: this.username,
						password: this.password
					}, 
					headers: {
						"Session-token": token
					}
				}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
// 						this.log("Refresh thermostat response success");
						var json = JSON.parse(body);
						this.temperature = parseFloat(json.temperature2);
						this.targetTemperature = parseFloat(json.temperature1);
						callback(null);
					} else {
// 						this.log("Refreshing failed with body: ", body);
						this.token = null;
						this.log(error);
						callback(err);
					}
				}.bind(this));
			} else {
				callback(error);
			}
		}.bind(this));
	}
	
    getCurrentHeatingCoolingState(callback) {
//         this.log('getCurrentHeatingCoolingState:', this.heatingCoolingState);
        callback(null, this.heatingCoolingState);
    }
	
	getTargetHeatingCoolingState(callback) {
//         this.log('getTargetHeatingCoolingState:', this.targetHeatingCoolingState);
        callback(null, this.targetHeatingCoolingState);
    }
	
    setTargetHeatingCoolingState(value, callback) {
// 	    this.log("setTargetHeatingCoolingState: ",value);
	    callback();
    }
	
	getCurrentTemperature(callback) {
// 		this.log("getCurrentTemperature");
		this.refreshThermostat(function (error) {
			if (error) {
				this.log(error);
				callback(error);
			} else {
// 				this.log("currentTemperature: ", this.temperature);
				callback(null, this.temperature);
			}
		}.bind(this));
	}
	
    getTargetTemperature(callback) {
// 	    this.log("getTargetTemperature");
		this.refreshThermostat(function (error) {
			if (error) {
				this.log(error);
				callback(error);
			} else {
				this.log("targetTemperature: ", this.targetTemperature);
				callback(null, this.targetTemperature);
			}
		}.bind(this));
    }
	
	setTargetTemperature(value, callback) {
//         this.log("setTargetTemperature: ", value);
		
		this.refreshToken(function (error, token) {
			if (token) {
		        request.post({
					url: this.apiroute + "/data",
					form: {
						uid: this.uid,
						temperature1: value
					}, 
					headers: {
						"Session-token": token
					}
				}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
// 						this.log("setTargetTemperature response success");
						callback(null);
					} else {
						this.log(error);
						this.token = null;
						callback(err);
					}
				}.bind(this));
			} else {
				callback(error);
			}
		}.bind(this));
    }
	
    getTemperatureDisplayUnits(callback) {
//         this.log("getTemperatureDisplayUnits: ", this.temperatureDisplayUnits);
        var error = null;
        callback(error, this.temperatureDisplayUnits);
    }
	
    setTemperatureDisplayUnits(value, callback) {
//         this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
        this.temperatureDisplayUnits = value;
        var error = null;
        callback(error);
    }
	
    getHeatingThresholdTemperature(callback) {
//         this.log("getHeatingThresholdTemperature: " , this.heatingThresholdTemperature);
        var error = null;
        callback(error, this.heatingThresholdTemperature);
    }
	
	getName(callback) {
// 		this.log("getName: ", this.name);
		var error = null;
		callback(error, this.name);
	}
	
	getServices() {
// 		this.log("Setting up services.");
		
		var informationService = new Service.AccessoryInformation();
		
		informationService
			.setCharacteristic(Characteristic.Manufacturer, 'Essent')
			.setCharacteristic(Characteristic.Model, 'E-Thermostaat')
			.setCharacteristic(Characteristic.SerialNumber, '');
			
		this.service
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));
			
        this.service
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('get', this.getTargetTemperature.bind(this))
            .on('set', this.setTargetTemperature.bind(this));

        this.service
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', this.getTemperatureDisplayUnits.bind(this))
            .on('set', this.setTemperatureDisplayUnits.bind(this));

        this.service
            .getCharacteristic(Characteristic.HeatingThresholdTemperature)
            .on('get', this.getHeatingThresholdTemperature.bind(this));

        this.service
            .getCharacteristic(Characteristic.Name)
            .on('get', this.getName.bind(this));
            
        return [informationService, this.service];
	}
}