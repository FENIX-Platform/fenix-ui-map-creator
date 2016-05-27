define([
    'loglevel',
    'jquery',
    'underscore',
    'fx-m-c/start',
    'text!test/models/UNECA_Population.json',
    'text!test/models/UNECA_Education.json',
    'text!test/models/UNECA_Population_pivotated.json'
], function (log, $, _, MapCreator, ModelPop, ModelEdu, ModelPivotData) {

    'use strict';
    
    var Model = JSON.parse(ModelEdu);
    //Model.data = JSON.parse(ModelPivotData);

    var s = {
            STANDARD: "#standard",
            TOOLBAR: "#toolbar"
        };

    function Test() {}

    Test.prototype.start = function () {

        window.mapCreator = new MapCreator({
            el: s.STANDARD,
            model: Model,
            fenix_ui_map: {
                guiController: {
                    container: s.TOOLBAR,
                    wmsLoader: false
                },
                baselayers: {
                    cartodb: {
                        title_en: "CartoDB light",
                        url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                        subdomains: 'abcd',
                        maxZoom: 19
                    },
                    esri_grayscale: {
                        url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                        title_en: "Esri WorldGrayCanvas",
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                        maxZoom: 16
                    }
                }
            }
        });

        mapCreator.on('ready', _.bind(function() {

            mapCreator.addLayer( new L.TileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                subdomains: 'abcd',
                maxZoom: 19
            }) );
 
            $.get('dataset/bangkok.json', function (model) {

                mapCreator.addLayer(model, { colorramp: 'Reds' });
            });

        }, this));

    };

    return new Test();

});