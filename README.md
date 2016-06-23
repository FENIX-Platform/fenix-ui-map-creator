# FENIX Map Creator

```javascript

var MapCreator = require('fx-dashboard/start');

var mapCreator = new MapCreator({

   geoSubject: 'gaul0',

   colorRamp: 'GnBu',  //Blues, Greens. colorRamp values: http://fenixrepo.fao.org/cdn/fenix/fenix-ui-map-datasets/colorramp.png

   legendtitle: 'ODA',

   fenix_ui_map: {

      guiController: {
         overlay: false,
         baselayer: false,
         wmsLoader: false
      },

      baselayers: {
         "cartodb": {
             title_en: "CartoDB light",
             url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
             subdomains: 'abcd',
             maxZoom: 19
             // title_en: "Baselayer",
             // url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
             // subdomains: 'abcd',
             // maxZoom: 19
         }
      },
      labels: true,
      boundaries: true,
      zoomToCountry: ["DZA"],
      highlightCountry: ["DZA"]
   }
});
```
