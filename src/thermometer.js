(function() {
    var fs = require('fs-extra-promise')
    var path = require("path")
    var _ = require('lodash')
    var exec = require('child-process-promise').exec;

    function Thermometer(settings) {
        defaultSettings = {
            device: "w1_slave",
            devicePath: "/sys/bus/w1/devices/"
        }
        this.settings = _.assign(defaultSettings, settings)
    }

    Thermometer.prototype.getThermometerData = function() {
        var file = this.getDevicePath()

        if(fs.lstatSync(file).isFile()) {
            return fs.readFileAsync(file, 'utf8')
        } else {
            return Promise.reject(new Error(file + ' doesn\'t exist!'))
        }
    }

    Thermometer.prototype.checkCrc = function(data) {        
        if(/.*([a-fA-F0-9]{2})\s:\scrc=([0-9]+)\sYES/g.test(data)) {
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
        return this.checkCrc(data).then(function(data){
            if(data.match(/.*t=([0-9])/g)) {
                var temp = data.replace(/.*\s.*t=([0-9]+)/, '$1')/1000
                temp = parseFloat(temp)
                return Promise.resolve(temp)
            } else {
                throw new Error('data non conforme')
            }
        })
    }

    Thermometer.prototype.lsmod = function() {
        return exec('lsmod')
    }

    Thermometer.prototype.getDevicePath = function () {
        var settings = this.settings

        var file = path.join(settings.devicePath, settings.device)
        return path.normalize(file)
    }

    Thermometer.prototype.checkModulesStatus = function() {
        return this.lsmod().then(function(result){
            var regW1GpioTest = /w1-gpio/m
            var regW1TermTest = /w1-therm/m
            if(!regW1GpioTest.test(result)) {
                return Promise.reject(new Error('w1-gpio driver is not installed. Try "sudo modprobe w1-gpio" and try again'))
            } 
            if(!regW1TermTest.test(result)) {
                return Promise.reject(new Error('w1-term driver is not installed. Try "sudo modprobe w1-term" and try again'))
            } 
            return Promise.resolve(true)
        })
    }

    Thermometer.prototype.checkIsReadable = function() {
        return new Promise(function(resolve, reject) {
            var file = this.getDevicePath()

            fs.lstat(file, function(err) {
                !err ? resolve() : reject()
            })
        }.bind(this))
    }

    module.exports = Thermometer
}())