var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var Thermometer = require('../src/thermometer')

describe("thermometer", function () {
	describe("getThermometerData", function() {
		it("should open a file and read the data and return it as a promise", function() {
			var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})

			return thermometer.getThermometerData().then(function(data) {
				expect(data).to.be.a('String')
			})

		})
	})

	describe("getTemperatureFromData", function() {
		it('should return a promise with the temperature in celcius from the data', function() {
			var thermometer = new Thermometer({devicePath: __dirname + '/../test-data/'})
			return thermometer.getThermometerData().then(function(data) {
				return thermometer.getTemperatureFromData(data).then(function(temp) {
					expect(temp).to.be.a("number")
				})
			})
		})
	})
})