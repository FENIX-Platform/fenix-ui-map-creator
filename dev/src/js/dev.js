define([
    'loglevel',
    'jquery',
    'underscore',
    '../../../src/js/index',
    'dev/src/models/UNECA_Population.json',
    'dev/src/models/UNECA_Education.json'
], function (log, $, _, MapCreator, ModelPop, ModelEdu) {

    'use strict';

    var MODEL = ModelEdu;

    var LANG = 'en';

    var s = {
        STANDARD: "#standard",
        TOOLBAR: "#toolbar"
    };

    function Dev() {
        this._importThirdPartyCss();
        log.setLevel('trace');
        log.info('Dev start');
        this.start();
    }

    Dev.prototype.start = function () {

        window.mapCreator = new MapCreator({
            el: s.STANDARD,
            lang: LANG,
            model: MODEL,
            fenix_ui_map: {
                guiController: {
                    container: '#toolbar',
                    overlay: true,
                    baselayer: true,
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
                },
                labels: true,
                highlightCountry: ['TCD', 'MLI', 'NER']
            }
        });

        mapCreator.on('ready', _.bind(function () {

            mapCreator.addLayer(L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'));

        }, this));

    };

    // utils

    Dev.prototype._importThirdPartyCss = function () {

        //Bootstrap
        require("bootstrap-loader");

        require("../../../node_modules/ion-rangeslider/css/ion.rangeSlider.css");
        require("../../../node_modules/ion-rangeslider/css/ion.rangeSlider.skinNice.css");
        //require("../../../node_modules/ion-rangeslider/css/ion.rangeSlider.skinHTML5.css");

        require("../../../node_modules/leaflet/dist/leaflet.css");
        
        require("../../../src/css/fenix-ui-leaflet.css");
        require("../../../src/css/fenix-ui-map-creator.css");

    };


    return new Dev();

});