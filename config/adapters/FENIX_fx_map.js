/*global define*/
define(function () {

    return {

        fenix_ui_map: {
            plugins: {
                geosearch: true,
                mouseposition: false,
                controlloading : true,
                zoomControl: 'bottomright'
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
        }
        // TODO: add boundaries option
    };
});