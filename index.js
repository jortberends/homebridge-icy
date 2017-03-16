var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-icy", "ICY", ICY);
};


function ICY(log, config) {
	this.log = log;
	this.maxTemp = config.maxTemp || 25;
	this.minTemp = config.minTemp || 15;
	this.name = config.name;
	this.apiroute = config.apiroute || "apiroute";
	this.log(this.name, this.apiroute);
	this.username = config.username || null;
	this.password = config.password || null;
	this.token = null;

	this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
	this.currentTemperature = 19;
	this.targetTemperature = 21;

	this.service = new Service.Thermostat(this.name);

}

ICY.prototype = {
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	
	getToken: function(callback) {
		if (this.token) {
			callback(null, this.token);
		}
		request.post({
			url: this.apiroute+"/login",
			form: {
				username: this.username,
				password: this.password
			}
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body);
				this.token = json.token;
				this.log("token retrieved: " + this.token);
				callback(null, this.token);
			}
			callback(err);
		}.bind(this));
	},
	
	// Required
	getCurrentTemperature: function(callback) {
		
		getToken(function (err, token) {
			if (!err && token != null) {
				request.get({
					url: this.apiroute + "/data",
					form: {
						username: this.username,
						password: this.password
					}
				}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						this.log("response success");
						var json = JSON.parse(body);
						this.currentTemperature = parseFloat(json.temperature1);
						this.targetTemperature = parseFloat(json.temperature2);
						callback(null, this.currentTemperature);
					}
					callback(err);
				}.bind(this));
			} else {
				this.log("Error retrieving token %s", err);
			}
		});
	},
	getTargetTemperature: function(callback) {
	},
	setTargetTemperature: function(value, callback) {
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		var error = null;
		callback(error, this.temperatureDisplayUnits);
	},
	setTemperatureDisplayUnits: function(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		var error = null;
		callback(error);
	},
	getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},

	getServices: function() {
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "HTTP Manufacturer")
			.setCharacteristic(Characteristic.Model, "HTTP Model")
			.setCharacteristic(Characteristic.SerialNumber, "HTTP Serial Number");

		

		// Required Characteristics

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

		// Optional Characteristics
		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));
			
		this.service.getCharacteristic(Characteristic.CurrentTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});
		this.service.getCharacteristic(Characteristic.TargetTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});
		this.log(this.minTemp);
		return [informationService, this.service];
	}
};