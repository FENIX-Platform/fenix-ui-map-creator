/*global define*/
define(function () {
    'use strict';

    var config = {

        paths : {
            'fx-m-c/start' : './map',
            'fx-m-c/html' : '../../html',
            'fx-m-c/config' : '../../config',
            'fx-m-c/templates' : './templates',

            // third party libs
            text: '{FENIX_CDN}/js/requirejs/plugins/text/2.0.12/text',
            jquery: '{FENIX_CDN}/js/jquery/2.1.1/jquery.min',
            underscore: '{FENIX_CDN}/js/underscore/1.7.0/underscore.min',
            amplify: '{FENIX_CDN}/js/amplify/1.1.2/amplify.min',
            handlebars: '{FENIX_CDN}/js/handlebars/2.0.0/handlebars',
            chosen: '{FENIX_CDN}/js/chosen/1.2.0/chosen.jquery.min',
            loglevel: '{FENIX_CDN}/js/loglevel/1.4.0/loglevel',
            q: '{FENIX_CDN}/js/q/1.1.2/q',

            // fenix-ui-map-js
            'import-dependencies':'{FENIX_CDN}/js/FENIX/utils/import-dependencies-1.0',
            'leaflet': '{FENIX_CDN}/js/leaflet/0.7.7/leaflet-src',
            'jquery.power.tip': '{FENIX_CDN}/js/jquery.power.tip/1.2.0/jquery.powertip.min',
            'jquery-ui': '{FENIX_CDN}/js/jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min',
            'jquery.i18n.properties': '{FENIX_CDN}/js/jquery.i18n.properties/1.0.9/jquery.i18n.properties-min',
            'jquery.hoverIntent': '{FENIX_CDN}/js/jquery.hoverIntent/1.8.0/jquery.hoverIntent.min',

            'leaflet-wfst': '{FENIX_CDN}/js/leaflet/plugins/leaflet-wfst/1.0.0/dist/Leaflet-WFST.min.js',

            //'fenix-ui-map': '{FENIX_CDN}/fenix/fenix-ui-map/0.1.0/dist/fenix-ui-map.min',
            //'fenix-ui-map-config': '{FENIX_CDN}/fenix/fenix-ui-map/0.1.0/dist/fenix-ui-map-config'
            'fenix-ui-map': '../../../fenix-ui-map/dist/fenix-ui-map.src',
            'fenix-ui-map-config': '../../../fenix-ui-map/dist/fenix-ui-map-config'            
        },

        shim: {
            'chosen': ['jquery'],   
            'amplify': ['jquery'],
            'jquery-ui': ['jquery'],
            'jquery.power.tip': ['jquery'],
            'jquery.hoverIntent': ['jquery'],
            'jquery.i18n.properties': ['jquery'],
            'leaflet-wfst': ['leaflet'],
            'fenix-ui-map': [
                'jquery',
                'jquery-ui',
                'leaflet',
                'fenix-ui-map-config',
                'jquery.power.tip',
                'jquery.i18n.properties',
                'import-dependencies',
                'jquery.hoverIntent',
                'chosen'
            ]
        }
    };

    return config;
});