define([
    'loglevel',
    'jquery',
    'underscore',
    '../../../src/js/index',
    'dev/src/models/UNECA_Population.json',
    'dev/src/models/UNECA_Education.json'
], function (log, $, _, MapCreator, ModelPop, ModelEdu) {

    'use strict';

    var Model = ModelEdu;

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
                },
                labels: true,
                highlightCountry: ['TCD', 'MLI', 'NER']
            }
        });

        mapCreator.on('ready', _.bind(function () {

            mapCreator.addLayer(new L.TileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                subdomains: 'abcd',
                maxZoom: 19
            }));

            $.get('dataset/bangkok.json', function (model) {

                //mapCreator.addLayer(model, { colorramp: 'Reds' });
            });

        }, this));

    };

    // utils

    Dev.prototype._importThirdPartyCss = function () {

        //Bootstrap
        require("bootstrap-loader");

        //dropdown selector
        require("../../../node_modules/selectize/dist/css/selectize.bootstrap3.css");
        //tree selector
        require("../../../node_modules/jstree/dist/themes/default/style.min.css");
        //range selector
        require("../../../node_modules/ion-rangeslider/css/ion.rangeSlider.skinHTML5.css");
        //time selector
        require("../../../node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css");
        // fenix-ui-filter
        require("../../../node_modules/fenix-ui-filter/dist/fenix-ui-filter.min.css");

        // fenix-ui-filter
        require("../../../node_modules/leaflet/dist/leaflet.css");


    };


    return new Dev();

});