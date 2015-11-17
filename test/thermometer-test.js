var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;
var Thermometer = require('../src/thermometer')
var path = require("path")


var getDevicePathMock = function(device){
    var devicePath = __dirname + '/../test-data/'
    var settings = this.settings
    device = device || settings.device

    var file = path.join(devicePath, settings.device)
    return path.normalize(file)
}

describe('thermometer', function () {

    describe('checkIsReadable', function() {
        it('should return a resolved promise if the device is readable', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock
            
            return thermometer.checkIsReadable()
        })

        it('should return a rejected promise if the device is not readable', function() {
            var thermometer = new Thermometer({device: 'nonExistingDevice'})
            thermometer.getDevicePath = getDevicePathMock

            expect(thermometer.checkIsReadable()).to.be.rejected
        })
    })

    describe('checkModulesStatus', function() {
        it('should check if the kernel modules are loaded and return a resolved promise', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock
            thermometer.lsmod = function() {
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-gpio                  1000  test' + "\n"
                str += 'w1-therm                  1000  test' + "\n"
                return Promise.resolve(str)
            }

            return thermometer.checkModulesStatus()
        })

        it('should fail if w1-gpio is not loaded and return a rejected promise', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock
            thermometer.lsmod = function() {
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-therm                  1000  test' + "\n"
                return Promise.resolve(str)
            }

            expect(thermometer.checkModulesStatus()).to.be.rejected
        })

        it('should fail if w1-therm is not loaded and return a rejected promise', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock
            thermometer.lsmod = function() {
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-gpio                  1000  test' + "\n"
                return Promise.resolve(str)
            }

            expect(thermometer.checkModulesStatus()).to.be.rejected
        })
    })

    describe('getThermometerData', function() {
        it('should open a file and read the data and return it as a promise', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock

            return thermometer.getThermometerData().then(function(data) {
                expect(data).to.be.a('String')
                expect(data).to.not.be.empty
            })

        })
    })
    
    describe('checkCrc', function() {
        it('should check the last byte of the answer corresponds to the calculated checksum and return a resolved promise', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock

            return thermometer.getThermometerData().then(thermometer.checkCrc)
        })
        
        it('should return a resolved promise containing the checked data', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock

            return thermometer.getThermometerData()
                .then(thermometer.checkCrc)
                .then(function(data) {
                    expect(data).to.be.a('String')
                    expect(data).to.not.be.empty                    
                })
        })
    })

    describe('getTemperatureFromData', function() {
        it('should return a promise with the temperature in celcius from the data', function() {
            var thermometer = new Thermometer()
            thermometer.getDevicePath = getDevicePathMock

            return thermometer.getThermometerData().then(function(data) {
                return thermometer.getTemperatureFromData(data).then(function(temp) {
                    expect(temp).to.be.a('number')
                    expect(temp).to.equal(25.5)
                })
            })
        })
    })
})