(function() {
	var fs = require('fs-extra-promise')
	var path = require("path")
	var _ = require('lodash');

	function Thermometer(settings) {
		defaultSettings = {
			device: "w1_slave",
			devicePath: "/sys/bus/w1/devices/"
		}
		this.settings = _.assign(defaultSettings, settings)
	}

	Thermometer.prototype.getThermometerData = function(devicePath) {
		var settings = this.settings

		var file = path.join(devicePath || settings.devicePath, settings.device)
		file = path.normalize(file)

		if(fs.lstatSync(file).isFile()) {
			return fs.readFileAsync(file, 'utf8')
		} else {
			return Promise.reject(new Error(file + ' doesn\'t exist!'))
		}
	}

	Thermometer.prototype.getTemperatureFromData = function(data) {
		if(data.match(/.*t=([0-9])/g)) {
			return Promise.resolve(data.replace(/.*t=([0-9])/g, '$1')/1000)
		} else {
			throw new Error('data non conforme')
		}
	}

	module.exports = Thermometer
}())