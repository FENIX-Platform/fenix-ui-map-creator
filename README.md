# FENIX Map Creator

# Example
```javascript

var MapCreator = require('fx-dashboard/start');

var mapCreator = new MapCreator({
   el: '#map-creator',
   model: {},
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
             url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
         }
      },
      labels: true,
      boundaries: true
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
   <td>model</td>
      <td>Object</td>
      <td> - </td>
      <td> - </td>
      <td>Fenix Resource Object</td>
    </tr>
   <td>fenix_ui_map</td>
      <td>Object</td>
      <td>
      ```javascript
      guiController: {
         overlay: false,
         baselayer: false,
         wmsLoader: false
      },
      ...
      ```
      </td>
      <td> - </td>      
      <td>Pass options to Fenix ui Map Options</td>
    </tr>    
   <td>WMS_URL</td>
      <td>string</td>
      <td>"http://fenix.fao.org/demo/fenix/geoserver"</td>
      <td>"http://fenix.fao.org/geoserver" (production URI) </td>
      <td>URI for Geoserver Services, WMS/WFS Layers and others</td>
    </tr>
   <td>leaflet</td>
      <td>Object</td>
      <td>
      
      ```javascript
      {
            zoomControl: false,
            attributionControl: false,
            minZoom: 1
        }
        ```
        </td>
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
          <td>join.style</td>
          <td>Object</td>
          <td>
          
          ```javascript
            {
                layertype: 'JOIN',
                jointype: 'shaded',
                defaultgfi: true,
                openlegend: true,
                lang: 'EN',
                opacity: '0.7',
                colorramp: 'Greens',
                decimalvalues: 2
            }
            ```
            </td>
          <td> - </td>
          <td>Style rules for Join Map</td>
        </tr>
     <tr>
          <td>join.layerMapping</td>
          <td>Object</td>
          <td>
          
          ```javascript
          {
                gaul0: {
                    layers: 'fenix:gaul0_3857',
                    joincolumn: 'adm0_code',
                    joincolumnlabel: 'adm0_name'
                },
                gaul1: {
                    layers: 'fenix:gaul1_3857',
                    joincolumn: 'adm1_code',
                    joincolumnlabel: 'adm1_name'
                },
                iso3: {
                    layers: 'fenix:gaul0_faostat3_3857',
                    joincolumn: 'iso3',
                    joincolumnlabel: 'areanamee'
                },
                uneca_iso3: {
                    layers: 'fenix:gaul0_faostat3_3857',
                    joincolumn: 'iso3',
                    joincolumnlabel: 'areanamee'
                },
                ...
            }
            ```
            </td>
          <td> - </td>
          <td>Geoserver Layers correspondence for geoSubject in Join operations </td>
        </tr>      
        <tr>
           <td>layers</td>
           <td>Object</td>
           <td>-</td>
           <td>
           
           ```javascript
           {
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
         }, ...
        }
        ```
        </td>
         <td>Layers preloaded in the map</td>
         </tr>
         
         
  </tbody>
</table>

# Methods
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Parameters</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>invalidateSize</td>
      <td> - </td>
      <td>Update Map dimensions after container is resized</td>
    </tr>
    <tr>
      <td>addLayer</td>
      <td>Object: Fenix Model | Leaflet Layer</td>
      <td>Append more Fenix Layers in the same map</td>
    </tr>
    <tr>
      <td>addBaseLayer</td>
      <td>Object: Leaflet Layer</td>
      <td>Append more Base Layers in the same map</td>
    </tr>    
    <tr>
      <td>dispose</td>
      <td>-</td>
      <td>destroy the map</td>
    </tr>        
  </tbody>
</table>

# Events
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Parameters</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ready</td>
      <td> - </td>
      <td>Run after Map rendered data</td>
    </tr>
  </tbody>
</table>
