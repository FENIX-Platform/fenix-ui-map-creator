/*global requirejs, amplify, console*/
requirejs(['../../src/js/paths','../utils'], function (paths, Utils) {

    'use strict';

    var FENIX_CDN = "//fenixrepo.fao.org/cdn",
        baseUrl = '../../src/js/';

    // replace placeholders and baseUrl
    paths = Utils.replacePlaceholders(paths, FENIX_CDN);
    paths.baseUrl = baseUrl;

    requirejs.config(paths);

    requirejs(['fx-m-c/start', 'jquery', 'amplify'], function (MapCreator, $) {

        var mapCreator = new MapCreator();

        mapCreator.render({
            container: '.content',
            fenix_ui_map: {
                guiController: {
                    container: '#toolbar',
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

        // TODO: add map to existing map

        // TODO: add JOIN from catalog to the map
        amplify.subscribe('ready', function () {

            $.get('dataset/bangkok.json', function (model) {

                mapCreator.addLayer(model, { colorramp: 'Greens' });
            });

        });

    });

});
