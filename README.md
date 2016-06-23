# FENIX Map Creator

# Example
```javascript

var MapCreator = require('fx-dashboard/start');

var mapCreator = new MapCreator({
   geoSubject: 'gaul0',
   colorRamp: 'GnBu',  //Blues, Greens. colorRamp values http://fenixrepo.fao.org/cdn/fenix/fenix-ui-map-datasets/colorramp.png
   legendtitle: 'Example Override Legend Title',
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
# Configuration
<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Default Value</th>
      <th>Example</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>el</td>
      <td>CSS3 Selector/JavaScript DOM element/jQuery DOM element</td>
      <td> - </td>
      <td>"#container"</td>
      <td>component container</td>
    </tr>
   <tr>
   <td>WMS_URL</td>
      <td>string</td>
      <td>"http://fenix.fao.org/demo/fenix/geoserver"</td>
      <td>'adm0_code'</td>
      <td>URI for Geoserver Services, WMS/WFS Layers and others</td>
    </tr>
   <td>leaflet</td>
      <td>Object</td>
      <td>{
            zoomControl: false,
            attributionControl: false,
            minZoom: 1
        }</td>
      <td> - </td>
      <td>Override LeafletJs Map Options</td>
    </tr>    
    <tr>
      <td>geoSubject</td>
      <td>string</td>
      <td>'geo'</td>
      <td>'adm0_code'</td>
      <td>geo column for create Fenix Resource Join map</td>
    </tr>
    <tr>
      <td>valueSubject</td>
      <td>string</td>
      <td>'value'</td>
      <td> - </td>
      <td></td>
    </tr>    
    <tr>
      <td>colorRamp</td>
      <td>string</td>
      <td>"Reds"</td>
      <td>"Greens"</td>
      <td>Scale of colors for join map, possibile values: <br>
      [colorramp.png](http://fenixrepo.fao.org/cdn/fenix/fenix-ui-map-datasets/colorramp.png)
      </td>
    </tr>
    <tr>
      <td>muSubject</td>
      <td>string</td>
      <td>"full"</td>
      <td>"half"</td>
      <td>Measurement unit displayed in map popup and legend</td>
    </tr>
     <tr>
          <td>face</td>
          <td>string</td>
          <td>"front"</td>
          <td>"back"</td>
          <td>Box displayed face</td>
        </tr>
    <tr>
        <td>faces</td>
        <td>Array of string</td>
        <td>["front", "back"]</td>
        <td>["front"]</td>
        <td>Box faces to render</td>
      </tr>
      
        <tr>
              <td>layers</td>
              <td>Object of Objects</td>
              <td>-</td>
              <td>{
            gaul0: {
                layers: 'fenix:gaul0_3857',
                urlWMS: 'http://fenix.fao.org/demo/fenix/geoserver',
                opacity: '0.9',
                joincolumn: 'adm0_code',
                joincolumnlabel: 'areanamee',
                layertype: 'JOIN',
                jointype: 'shaded',
                openlegend: true,
                defaultgfi: true,
                colorramp: 'YlGn',
                lang: 'en'
            }
        }</td>
              <td>Top left menu configuration</td>
         </tr>
  </tbody>
</table>

# Events

ready
# Methods

.
