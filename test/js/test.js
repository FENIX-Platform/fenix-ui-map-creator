define([
    'loglevel',
    'jquery',
    'underscore',
    'fx-m-c/start',
    'test/models/Model1'
], function (log, $, _, Map, Model) {

    'use strict';

    var s = {
            STANDARD: "#standard"
        },
        instances = [];

    function Test() {
    }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._render();

    };

    Test.prototype._render = function () {

        this._renderStandard();

    };

    Test.prototype._renderStandard = function () {
        console.log(Model)
        console.log(Map)

        return;

        var map = this.createInstance({
            el : s.STANDARD,
            model : Model
        })

    };

    //Utils

    Test.prototype.createInstance = function (params) {

        var instance = new Map(params);

        instances.push(instance);

        return instance;
    };

    return new Test();

});