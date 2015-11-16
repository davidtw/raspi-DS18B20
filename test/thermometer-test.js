var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var Thermometer = require('../src/thermometer')

describe('thermometer', function () {
    describe('getThermometerData', function() {
        it('should open a file and read the data and return it as a promise', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})

            return thermometer.getThermometerData().then(function(data) {
                expect(data).to.be.a('String')
                expect(data).to.not.be.empty
            })

        })
    })
    
    describe('checkCrc', function() {
        it('should check the last byte of the answer corresponds to the calculated checksum and return a resolved promise', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            return thermometer.getThermometerData().then(thermometer.checkCrc)
        })
        
        it('should return a resolved promise containing the checked data', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            return thermometer.getThermometerData()
                .then(thermometer.checkCrc)
                .then(function(data){
                    expect(data).to.be.a('String')
                    expect(data).to.not.be.empty                    
                })
        })
    })

    describe('getTemperatureFromData', function() {
        it('should return a promise with the temperature in celcius from the data', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            return thermometer.getThermometerData().then(function(data) {
                return thermometer.getTemperatureFromData(data).then(function(temp) {
                    expect(temp).to.be.a('number')
                    expect(temp).to.equal(25.5)
                })
            })
        })
    })

    describe('checkModulesStatus', function() {
        it('should check if the kernel modules are loaded', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            thermometer.lsmod = function(){
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-gpio                  1000  test' + "\n"
                str += 'w1-therm                  1000  test' + "\n"
                return Promise.resolve(str)
            }
            return thermometer.checkModulesStatus()
        })
    })

    describe('checkModulesStatus', function() {
        it('should fail if w1-gpio is not loaded', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            thermometer.lsmod = function(){
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-therm                  1000  test' + "\n"
                return Promise.resolve(str)
            }
            expect(thermometer.checkModulesStatus()).to.be.rejected
        })
    })

    describe('checkModulesStatus', function() {
        it('should fail if w1-therm is not loaded', function() {
            var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
            thermometer.lsmod = function(){
                var str = 'Module                  Size  Used by' + "\n"
                str += 'w1-gpio                  1000  test' + "\n"
                return Promise.resolve(str)
            }
            expect(thermometer.checkModulesStatus()).to.be.rejected
        })
    })

})