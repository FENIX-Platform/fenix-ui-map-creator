/*global define*/
define(function () {

    'use strict';

    return {

        fenix_ui_map: {

            plugins: {
                disclaimerfao: true,
                geosearch: true,
                mouseposition: false,
                controlloading : true,
                zoomcontrol: 'bottomright'
            },
            guiController: {
                overlay: true,
                baselayer: true,
                wmsLoader: true
            },
            gui: {
                disclaimerfao: true
            }
        },
        leaflet: {
            zoomControl: false,
            attributionControl: false
        },
        layers: {
            boundary: {
                layers: 'fenix:gaul0_line_3857',
                layertitle: 'Country Boundaries',
                // TODO: remove the url to wms
                urlWMS: 'http://fenixapps2.fao.org/geoserver-demo',
                opacity: '0.9',
                lang: 'en'
            },
            gaul0: {
                layers: 'fenix:gaul0_faostat_3857',
                // TODO: remove the url to wms
                urlWMS: 'http://fenixapps2.fao.org/geoserver-demo',
                opacity: '0.6',
                joincolumn: 'adm0_code',
                joincolumnlabel: 'areanamee',
                layertype: 'JOIN',
                jointype: 'shaded',
                openlegend: true,
                defaultgfi: true,
                colorramp: 'OrRd',
                lang: 'en'
            }
        },
        url: {
            wms: "http://fenix.fao.org/demo/ghg/geoserver"
        },
        geoSubject: 'geo',
        valueSubject: 'value',
        // measurement unit
        muSubject: null,

        // Mapping with the
        join: {

            layerMapping: {
                gaul0: {
                    layers: 'fenix:gaul0_3857',
                    joincolumn: 'adm0_code',
                    joincolumnlabel: 'adm0_name'
                },
                gaul1: {
                    layerName: ''
                },

                gaul_adm1: {
                    layers: 'fenix:gaul1_3857',
                    joincolumn: 'adm1_code',
                    joincolumnlabel: 'adm1_name'
                },

                faostat_countrycodes: {
                    layers: 'fenix:gaul0_faostat_3857',
                    joincolumn: 'faost_code',
                    joincolumnlabel: 'areanamee'
                }
            },
            style: {
                layertype: 'JOIN',
                jointype: 'shaded',
                defaultgfi: true,
                openlegend: true,
                lang: 'EN',
                opacity: '0.7'
            }
        }
        // TODO: add boundaries option
    };
});