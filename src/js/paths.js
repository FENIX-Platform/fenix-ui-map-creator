/*global define*/
define(function () {

    var config = {

        paths : {
            'fx-m-c/start' : './start',
            'fx-m-c/html' : '../html',
            'fx-m-c/config' : '../../config',
            'fx-m-c/adapters' : './adapters',
            'fx-m-c/templates' : './templates',
            // third party libs
            text: '//fenixapps.fao.org/repository/js/requirejs/plugins/text/2.0.12/text',
            jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
            underscore: "//fenixapps.fao.org/repository/js/underscore/1.7.0/underscore.min",
            amplify: "//fenixapps.fao.org/repository/js/amplify/1.1.2/amplify.min",

            'handlebars': 'node_modules/handlebars/dist/handlebars.min',
            'domReady':  'node_modules/domReady/domReady',

            // fenix-ui-map-js
            'import-dependencies':'http://fenixapps.fao.org/repository/js/FENIX/utils/import-dependencies-1.0',
            'leaflet': '../../node_modules/leaflet/dist/leaflet',
            'jquery.power.tip': '../../node_modules/jquery-powertip/dist/jquery.powertip.min',
            'jquery-ui':   'http://fenixapps.fao.org/repository/js/jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min',
            'jquery.i18n.properties': 'http://fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
            'jquery.hoverIntent': '../../node_modules/jquery.hoverIntent/jquery.hoverIntent.min',

            'fenix-ui-map': '../../libs/fenix-ui-map/fenix-ui-map.min',
            'fenix-ui-map-config': '../../libs/fenix-ui-map/fenix-ui-map-config'
        },

        shim: {
            'jquery-ui': ['jquery'],
            'jquery.power.tip': ['jquery'],
            'jquery.i18n.properties': ['jquery'],
            'chosen': ['jquery'],
            'jquery.hoverIntent': ['jquery'],
            'fenix-ui-map': {
                deps: [
                    'jquery',
                    'jquery-ui',
                    'leaflet',
                    'fenix-ui-map-config',
                    'jquery.power.tip',
                    'jquery.i18n.properties',
                    'import-dependencies',
                    'jquery.hoverIntent'
                ]
            },
             "amplify": {
                "deps": ["jquery"]
            }
        }
    };

    return config;
});
