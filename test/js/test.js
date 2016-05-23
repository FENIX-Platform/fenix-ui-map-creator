define([
    'loglevel',
    'jquery',
    'underscore',
    'fx-m-c/start',
    
    'text!test/models/UNECA_Population.json'

], function (log, $, _, MapCreator, Model) {

    'use strict';

    var Model = JSON.parse(Model);

    var s = {
            STANDARD: "#standard"
            //TODO TOOLBAR
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

        var map = this.createInstance({
            el : s.STANDARD,
            model : Model,
            fenix_ui_map: {
                /*guiController: {
                    container: s.TOOLBAR,
                },*/
                baselayers: {
                    "cartodb": {
                        title_en: "CartoDB light",
                        url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                        subdomains: 'abcd',
                        maxZoom: 19
                    },
                    "esri_grayscale": {
                        url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                        title_en: "Esri WorldGrayCanvas",
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                        maxZoom: 16
                    }
                }                
            }
        })

    };

    //Utils

    Test.prototype.createInstance = function (params) {

        var instance = new MapCreator(params);

        instances.push(instance);

        return instance;
    };

    return new Test();

});