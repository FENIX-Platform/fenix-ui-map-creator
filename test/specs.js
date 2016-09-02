/*global describe, it, require*/
var Component = require("../src/js/index"),
    $ = require("jquery");

describe("Component", function () {
    it("should be not null", function () {
        expect(Component).to.be.not.null;
    });
});