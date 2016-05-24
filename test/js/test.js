define([
    'loglevel',
    'jquery',
    'underscore',
    'fx-m-c/start',
    'text!test/models/UNECA_Population.json',
    'text!test/models/UNECA_Population_pivotated.json'
], function (log, $, _, MapCreator, ModelFenix, ModelPivotData) {

    'use strict';
    
    //ModelFenix = JSON.parse(ModelFenix);

    var Model = {};
    Model.data = JSON.parse(ModelPivotData);

    var s = {
            STANDARD: "#standard",
            TOOLBAR: "#toolbar"
        },
        instances = [];

    function Test() {}

    Test.prototype.start = function () {

        log.trace("Test started");

        this._render();

    };

    Test.prototype._render = function () {

        this._renderStandard();

    };

    Test.prototype._renderStandard = function () {

        var mapCreator = new MapCreator({
            el : s.STANDARD,
            model : Model,
            fenix_ui_map: {
                guiController: {
                    container: s.TOOLBAR,
                    wmsLoader:false
                },
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
        });

        mapCreator.on('ready', _.bind(function() {

            console.log('MapCreator ready', mapCreator)

            mapCreator.map.addLayer( new L.TileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                subdomains: 'abcd',
                maxZoom: 19
            }) );
 
            $.get('dataset/bangkok.json', function (model) {
                mapCreator.addLayer(model, { colorramp: 'Greens' });
            });

        }, this));

    };

    return new Test();

});