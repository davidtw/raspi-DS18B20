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

	Thermometer.prototype.checkCrc = function(data) {		
		if(data.match(/.*([a-fA-F0-9]{2})\s:\scrc=([0-9]+)\sYES/g)) {
			var crc = data.replace(/.*([a-fA-F0-9]{2})\s:\scrc=([0-9]+).*\n.*/gmi, '$1-$2').split('-')			
			if(crc[0] === crc[1]) {
				return Promise.resolve(data)
			} else {
				throw new Error('crc failed : bytes don\'t correspond')
			}
		} else {
			throw new Error('crc failed : Crc = NO')
		}
	}
	
	Thermometer.prototype.getTemperatureFromData = function(data) {
		if(data.match(/.*t=([0-9])/g)) {
			var temp = data.replace(/.*\s.*t=([0-9]+)/, '$1')/1000
			temp = parseFloat(temp)
			return Promise.resolve(temp)
		} else {
			throw new Error('data non conforme')
		}
	}

	module.exports = Thermometer
}())