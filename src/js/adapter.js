/*global define, amplify, FM */
define([
        'jquery',
        'fx-m-c/config/adapters/FENIX_fx_map',
        'underscore',
        'fenix-ui-map',
        'amplify'
    ],
    function ($, baseConfig, _) {

        'use strict';

        var defaultOptions = {
                lang: 'EN',
                s: {
                    CONTENT: '[data-role="content"]'
                },
                //type: 'timeseries', //[custom, scatter, pie]
                geoSubject: 'geo',
                valueSubject: 'value',
                // measurement unit
                muSubject: 'um',
                fenix_ui_map: {
                    DEFAULT_WMS_SERVER: 'http://fenix.fao.org/demo/fenix/geoserver',
                    guiController: {
                        overlay: true,
                        baselayer: true,
                        wmsLoader: false
                    },
                    gui: {
                        disclaimerfao: false
                    }
                }
            },
            e = {
                DESTROY: 'fx.component.map.destroy',
                READY: 'fx.component.map.ready'
            };

        function FENIX_FX_MAP_Adapter() {
            this.o = $.extend(true, {}, defaultOptions);
        }

        FENIX_FX_MAP_Adapter.prototype.render = function (config) {
            this.o = $.extend(true, {}, this.o, config);

            if (this._validateInput() === true) {
                this._initVariable();
                this._prepareData();
                if (this._validateData() === true) {
                    this._onValidateDataSuccess();
                } else {
                    this._onValidateDataError();
                }
            } else {
                throw new Error("FENIX Map creator has not a valid configuration");
            }
        };

        FENIX_FX_MAP_Adapter.prototype._prepareData = function () {

        };

        FENIX_FX_MAP_Adapter.prototype._validateData = function () {
            this.errors = {};
            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype._initVariable = function () {
            //this.$container = $(this.container).find(this.s.id);
            //this.$metadata = this.model.metadata;
            //this.$dsd = this.$metadata.dsd;
            //this.$columns = this.$dsd.columns;
            //this.$data = this.model.data;
            this.$map = $(this.o.container).find(this.o.s.CONTENT);
        };

        FENIX_FX_MAP_Adapter.prototype._validateInput = function () {
            this.errors = {};
            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype._onValidateDataSuccess = function () {
            this.$mapRendered = true;
            this._createConfiguration();
            this._renderMap();
        };

        FENIX_FX_MAP_Adapter.prototype._createConfiguration = function () {
            this.o = $.extend(true, {}, baseConfig, this.o);
        };

        FENIX_FX_MAP_Adapter.prototype._renderMap = function () {
            this.fenixMap = new FM.Map(this.$map, this.o.fenix_ui_map, this.o.leaflet);
            this.fenixMap.createMap();
            // Map Ready event
            amplify.publish(e.READY, this);
        };

        FENIX_FX_MAP_Adapter.prototype.addLayer = function (model, options) {

            var layer = null;
            // TODO: switch to check if it's a fenix layer
            if (!model.hasOwnProperty("metadata")) {
                this.errors.metadata = "Model does not contain 'metadata' attribute.";
                throw new Error("FENIX Map creator has not a valid configuration");
            }

            if (!model.hasOwnProperty("data"))
                layer = this.createLayerFenix(model);
            else
                layer = this.createLayerFenixJoin(model);
            
            if (options !== null)
                layer = $.extend(true, {}, layer, options);
            
            layer = new FM.layer(layer);

            this.fenixMap.addLayer(layer);

            return layer;
        };

        FENIX_FX_MAP_Adapter.prototype.createLayerFenix = function (model, options) {
            var metadata = model.metadata;
            var layer = {};

            // Define the layer
            if (metadata.hasOwnProperty("dsd")) {
                layer.layers = "";
                if (metadata.dsd.hasOwnProperty("workspace"))
                    layer.layers += metadata.dsd.workspace + ":";
                
                layer.layers += metadata.dsd.layerName;
            }
            else {
                this.errors['dsd'] = "Model['metadata'] does not contain 'dsd' attribute.";
                throw new Error("FENIX Map creator has not a valid configuration");
            }

            //TODO
            //if (model.hasOwnProperty("datasource"))
            //  layer.urlWMS = metadata["datasource"];
            
            layer.urlWMS = this.o.fenix_ui_map.DEFAULT_WMS_SERVER;
            layer.layertitle = 'Data Layer';
            layer.opacity = '0.9';

            return layer;
        };

        // JOIN
        FENIX_FX_MAP_Adapter.prototype.createLayerFenixJoin = function (model) {
            if (this._validateJoinInput(model) === true) {
                // create the join layer
                var layer = this.getJoinLayer(model);
                $.extend(true, layer, this.o.join.style);

                var defPopupBuilder = "<div class='fm-popup'>{{"+ layer.joincolumnlabel +"}}"+
                    "<div class='fm-popup-join-content'>{{{"+ layer.joincolumn + "}}} "+
                    "{{measurementunit}}"+
                    "</div></div>";

                // Layer title TODO: Add title if exist (check in the validator)
                if (model['metadata'].hasOwnProperty("title")) {
                    if (model['metadata']['title'][this.o.lang] !== null) {
                        layer.layertitle = model['metadata']['title'][this.o.lang];
                    }
                }
                else {
                    layer.layertitle = model['metadata']['uid'];
                }

                // getting a title from the options
                if ( this.o.hasOwnProperty('layer') && this.o.layer.hasOwnProperty('layertitle')) {
                    layer.layertitle = this.o.layer.layertitle;
                }

                if ( this.o.hasOwnProperty('layer') && this.o.layer.hasOwnProperty('popupBuilder')) {
                    layer.popupBuilder = this.o.layer.popupBuilder;
                }

                //console.log(layer);

                layer.customgfi = {
                    showpopup: true,
                    content: {
                        EN: _.isFunction(layer.popupBuilder) ? layer.popupBuilder(layer.joincolumnlabel, layer.joincolumn) : defPopupBuilder
                    }
                };

                // TODO: add check on the zoomto data (move it to a function)
                var codes = []
                layer.joindata.forEach(function (code) {
                    _.keys(code).forEach(function (key) {
                        codes.push(key);
                    });
                });
                var zoomlayer = layer.layers.split(":");
                zoomlayer = zoomlayer.length > 1? zoomlayer[1]: zoomlayer[0];
                this.fenixMap.zoomTo(zoomlayer, layer.joincolumn, codes);
                return layer;
            } else {
                console.error(this.errors);
                throw new Error("FENIX Map creator has not a valid JOIN configuration");
            }
        };

        FENIX_FX_MAP_Adapter.prototype.getJoinLayer = function (model) {
            var metadata = model['metadata'];
            var columns = metadata['dsd']['columns'];
            var geoColumn = {};
            var valueColumn = {};
            var muColumn = {};
            columns.forEach(_.bind(function (column, index) {
                if (column.subject === this.o.geoSubject || column.id === this.o.geoSubject ) {
                    geoColumn = column;
                    geoColumn.index = index;
                }
                if (column.subject === this.o.valueSubject || column.id === this.o.valueSubject ) {
                    valueColumn = column;
                    valueColumn.index = index;
                }
                if (column.subject === this.o.muSubject) {
                    muColumn = column;
                    muColumn.index = index;
                }
            }, this));

            // getting the right measurement unit if the new label exists
            columns.forEach(_.bind(function (column, index) {
                if (muColumn.id + '_' + this.o.lang) {
                    muColumn = column;
                    muColumn.index = index;
                }
            }, this));


            if (this._validateJoinColumnInput(geoColumn)) {
                // TODO: check reference area and if exist the variable geoColumn['domain']['codes'][0].idCodeList
                //var layer = this.join.layerMapping[geoColumn['domain']['codes'][0].idCodeList.toLowerCase()];
                var layer = null;
                var codelist = geoColumn['domain']['codes'][0].idCodeList.toLowerCase();

                // if codelist has a mapping with the join.layerMapping then use it.
                if (this.o.join.layerMapping[codelist]) {
                    layer = this.o.join.layerMapping[codelist];
                }

                // else check with the referenceArea the right correspondacy
                else {
                    geoColumn['domain']['codes'][0].idCodeList.toLowerCase();
                    // TODO: Handle reference Area
                    var referenceArea = metadata["meContent"]["seReferencePopulation"]["referenceArea"]['codes'][0].code.toLowerCase();
                    layer = this.o.join.layerMapping[codelist + "_" + referenceArea];
                }

                // data model to be mapped
                var data = model.data;


                // check measurementunit
                // TODO: Add measurement unit to the layer definition (using label column of the mu)
                //

                // get joinData
                layer.joindata = this.getJoinData(data, geoColumn.index, valueColumn.index);

                // TODO: check on the column index
                layer.measurementunit = data[0][muColumn.index];

                // TODO: check if is the right legendtitle
                layer.legendtitle = layer.measurementunit;

                return layer;
            } else{
                console.error('Error JoinColumnInput not valid')
            }
        };

        FENIX_FX_MAP_Adapter.prototype.getJoinData = function (data, geoColumnIndex, valueColumnIhdex) {
            var joindata = [];

            // TODO: remove cachedValues on final version. Check on join data consistency?
            var cachedValues = {}
            // TODO: add on check
            data.forEach(_.bind(function (row) {
                var obj = {}
                var code = row[geoColumnIndex];
                var value = row[valueColumnIhdex];
                if (code && value) {
                    obj[code] = value ;
                    if (!cachedValues.hasOwnProperty(code)) {
                        // check null values
                        cachedValues[code] = true;
                        joindata.push(obj);
                    }
                }
            }, this));

            return joindata;
        };

        // TODO: Add additional validations constraints
        // Costrains: on geoColumn
        // column['dataType'] == code
        // column['key'] == true
        // column['domain']['codes'][0].idCodelist == gaul0
        // look to referenceArea i.e. gaul0, gaul2, gaul2)
        FENIX_FX_MAP_Adapter.prototype._validateJoinInput = function (model) {
            this.errors = {};

            //Metadata TODO: add all metadata checks
            if (!model.hasOwnProperty("metadata")) {
                this.errors.metadata = "'metadata' attribute not present.";
            }

            //Data
            if (!model.hasOwnProperty("data")) {
                this.errors.data = "'data' attribute not present.";
            }

            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype._validateJoinColumnInput = function (column) {
            this.errors = {};

            //Metadata TODO: add all metadata checks
            if (!column.hasOwnProperty('key')) {
                this.errors.column = "'key' attribute not present.";
            }
            else {
                if (column.key !== true) {
                    this.errors.column = "'key' is not true.";
                }
            }

            if (!column.hasOwnProperty('dataType')) {
                this.errors.column = "'dataType' attribute not present.";
            }
            else {
                if (column.dataType !== 'code') {
                    this.errors.column = "'dataType' attribute is not a coding system.";
                }
            }

            // TODO: check domain and referencearea if needed

            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype.addCountryBoundaries = function (opts) {
            // if add boundaries by default
            if (opts !== null && opts !== undefined) {
                this.o.layers.boundary = $.extend(true, {}, opts, this.o.layers.boundary);
            }
            this.fenixMap.addLayer(new FM.layer(this.o.layers.boundary));
        };

        FENIX_FX_MAP_Adapter.prototype.addCountryLabels = function (opts) {
            if (opts !== null && opts !== undefined) {
                this.o.layers.labels = $.extend(true, {}, opts, this.o.layers.labels);
            }
            var tlayer = new L.TileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                subdomains: 'abcd',
                maxZoom: 19
            });
            this.fenixMap.map.addLayer(tlayer);
        };        

        FENIX_FX_MAP_Adapter.prototype.removeLayer = function (layer) {
            this.fenixMap.removeLayer(layer);
        };

        FENIX_FX_MAP_Adapter.prototype.invalidateSize = function () {
            this.fenixMap.map.invalidateSize();
        };

        return FENIX_FX_MAP_Adapter;
    });