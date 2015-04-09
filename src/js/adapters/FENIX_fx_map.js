/*global define*/
define([
        'jquery',
        'fx-m-c/config/adapters/FENIX_fx_map',
        'underscore',
        'fenix-ui-map',
        'amplify'
    ],
    function ($, baseConfig, _) {

        var defaultOptions = {
                lang: 'EN',
                s: {
                    //CONTENT: '[data-role="content"]'
                    CONTENT: 'map'
                },
                //type: 'timeseries', //[custom, scatter, pie]

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
                        faostat_countrycodes: {
                            layers: 'fenix:gaul0_faostat_3857',
                            joincolumn: 'faost_code',
                            joincolumnlabel: 'areanamee'
                        },
                    },
                    style: {
                        layertype: 'JOIN',
                        jointype: 'shaded',
                        defaultgfi: true,
                        openlegend: true,
                        lang: 'EN',
                        opacity: '0.7'
                    }
                },

                data: {},

                aux: {
                    ids: [],
                    subjects: [],
                    id2index: {},
                    index2id: {},
                    //contains id_column : {code : label}
                    code2label: {},
                    subject2id: {},
                    id2subject: {},
                    nameIndexes: []
                }
            },
            e = {
                DESTROY: 'fx.component.map.destroy',
                READY: 'fx.component.map.ready'
            };

        function FENIX_FX_MAP_Adapter() {
            $.extend(true, this, defaultOptions);
        }

        FENIX_FX_MAP_Adapter.prototype.render = function (config) {
            $.extend(true, this, config);

            if (this._validateInput() === true) {
                this._initVariable();
                this._prepareData();
                if (this._validateData() === true) {
                    this._onValidateDataSuccess();
                } else {
                    this._onValidateDataError();
                }
            } else {
                console.error(this.errors);
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
        };

        FENIX_FX_MAP_Adapter.prototype._validateInput = function () {
            this.errors = {};

            ////Container
            //if (!this.hasOwnProperty("container")) {
            //    this.errors['container'] = "'container' attribute not present.";
            //}
            //
            //if ($(this.container).find(this.s.CONTENT) === 0) {
            //    this.errors['container'] = "'container' is not a valid HTML element.";
            //}
            //
            ////Model
            //if (!this.hasOwnProperty("model")) {
            //    this.errors['model'] = "'model' attribute not present.";
            //}
            //
            //if (typeof this.model !== 'object') {
            //    this.errors['model'] = "'model' is not an object.";
            //}
            //
            ////Metadata
            //if (!this.model.hasOwnProperty("metadata")) {
            //    this.errors['metadata'] = "Model does not container 'metadata' attribute.";
            //}
            //
            ////DSD
            //if (!this.model.metadata.hasOwnProperty("dsd")) {
            //    this.errors['dsd'] = "Metadata does not container 'dsd' attribute.";
            //}
            //
            ////Columns
            //if (!Array.isArray(this.model.metadata.dsd.columns)) {
            //    this.errors['columns'] = "DSD does not container a valid 'columns' attribute.";
            //}
            //
            ////Option
            //if (this.options && typeof this.options !== 'object') {
            //    this.errors['options'] = "'options' is not an object.";
            //}
            //
            ////Data
            //if (!this.model.hasOwnProperty("data")) {
            //    this.errors['data'] = "Model does not container 'data' attribute.";
            //}
            //
            //// seriesSubject
            //if (!Array.isArray(this.seriesSubject)) {
            //    this.errors['seriesSubject'] = "SeriesSubject is not an Array element";
            //}
            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype._onValidateDataSuccess = function () {
            this.$mapRendered = true;
            this._createConfiguration();
            this._renderMap();
        };

        FENIX_FX_MAP_Adapter.prototype._createConfiguration = function () {
            this.config = $.extend(true, baseConfig, this.options, this.data);
        };

        FENIX_FX_MAP_Adapter.prototype._renderMap = function () {
            // map
            this.fenixMap = new FM.Map(this.s.CONTENT, this.config.fenix_ui_map, this.config.leaflet);
            this.fenixMap.createMap();
            // Map Ready event
            amplify.publish(e.READY, this);

            // if add boundaries by default
            //this.fenixMap.addLayer(new FM.layer(this.config.layers.boundary));
        };

        FENIX_FX_MAP_Adapter.prototype.addLayer = function (model) {
            // TODO: switch to check if it's a fenix layer
            if (!model.hasOwnProperty("metadata")) {
                this.errors['metadata'] = "Model does not contain 'metadata' attribute.";
                throw new Error("FENIX Map creator has not a valid configuration");
            }

            // Handle layers from FENIX (D3S)
            if (!model.hasOwnProperty("data")) {
                // standard layer
                this.fenixMap.addLayer(new FM.layer(this.createLayerFenix(model)));
            }
            else {
                // Create Join data layer
                this.fenixMap.addLayer(new FM.layer(this.createLayerFenixJoin(model)));
            }
        }

        FENIX_FX_MAP_Adapter.prototype.createLayerFenix = function (model) {
            var metadata = model["metadata"];
            var layer = {};

            // Define the layer
            if (metadata.hasOwnProperty("dsd")) {
                layer.layers = "";
                if (metadata["dsd"].hasOwnProperty("workspace"))
                    layer.layers += metadata["dsd"]["workspace"] + ":";
                layer.layers += metadata["dsd"]["layerName"];
            }
            else {
                this.errors['dsd'] = "Model['metadata'] does not contain 'dsd' attribute.";
                throw new Error("FENIX Map creator has not a valid configuration");
            }

            // WMS Server
            if (model.hasOwnProperty("datasource")) {
                console.log("datasource");
                // TODO: IMPORTAT! check which datasource and the right url from D3S!
            }
            else {
                console.warn("'datasource' propery not found in model. Using the default wms server: " + this.config.url.wms);
                layer.urlWMS = this.config.url.wms;
            }

            // Options
            layer.layertitle =  metadata["title"][this.lang];
            layer.opacity = '0.9';
            return layer;
        }

        // JOIN

        FENIX_FX_MAP_Adapter.prototype.createLayerFenixJoin = function (model) {
            if (this._validateJoinInput(model) === true) {

                // create the join layer
                var layer = this.getJoinLayer(model);
                $.extend(true, layer, this.join.style);

                // Layer title TODO: Add title if exist (check in the validator)
                if (model['metadata'].hasOwnProperty("title")) {
                    if (model['metadata']['title'][this.lang] != null) {
                        layer.layertitle = model['metadata']['title'][this.lang];
                    }
                }
                else {
                    layer.layertitle = "(JOIN) " + model['metadata']['uid'];
                }

                // create popup
                // TODO: Handle more dinamically from the model 'geo' codelist.
                layer.customgfi = {
                    content: {
                        EN: "<div class='fm-popup'>{{"+ layer.joincolumnlabel +"}}<div class='fm-popup-join-content'>{{{"+ layer.joincolumn+"}}}</div></div>"
                    },
                    showpopup: true
                }
                return layer;
            } else {
                console.error(this.errors);
                throw new Error("FENIX Map creator has not a valid JOIN configuration");
            }
        }

        FENIX_FX_MAP_Adapter.prototype.getJoinLayer = function (model) {
            var metadata = model['metadata'];
            var columns = metadata['dsd']['columns'];
            var geoColumn = {}
            var valueColumn = {}
            var muColumn = {}
            columns.forEach(_.bind(function (column, index) {
                if (column.subject === this.geoSubject) {
                    geoColumn = column;
                    geoColumn.index = index;
                }
                if (column.subject === this.valueSubject) {
                    valueColumn = column;
                    valueColumn.index = index;
                }
                if (column.subject === this.muSubject) {
                    muColumn = column;
                    muColumn.index = index;
                }
            }, this));

            // TODO: Handle reference Area
            var referenceArea = null;

            if (this._validateJoinColumnInput(geoColumn)) {
                var data = model['data'];

                // TODO: check reference area and if exist the variable geoColumn['domain']['codes'][0].idCodeList
                var layer = this.join.layerMapping[geoColumn['domain']['codes'][0].idCodeList.toLowerCase()];

                // check measurementunit
                // TODO: Add measurement unit to the layer definition

                // get joinData
                layer.joindata = this.getJoinData(data, geoColumn.index, valueColumn.index);
                return layer;
            }
        }

        FENIX_FX_MAP_Adapter.prototype.getJoinData = function (data, geoColumnIndex, valueColumnIhdex) {
            var joindata = [];
            var cachedValues = {}
            // TODO: add on check
            data.forEach(_.bind(function (row) {
                var obj = {}
                var code = row[geoColumnIndex];
                var value = row[valueColumnIhdex];
                if (code && value) {
                    obj[code] = value;
                    if (!cachedValues.hasOwnProperty(code)) {
                        // check null values
                        cachedValues[code] = true;
                        joindata.push(obj);
                    }
                }
            }, this));
            return joindata
        }

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
                this.errors['metadata'] = "'metadata' attribute not present.";
            }

            //Data
            if (!model.hasOwnProperty("data")) {
                this.errors['data'] = "'data' attribute not present.";
            }

            return (Object.keys(this.errors).length === 0);
        };

        FENIX_FX_MAP_Adapter.prototype._validateJoinColumnInput = function (column) {
            this.errors = {};

            //Metadata TODO: add all metadata checks
            if (!column.hasOwnProperty('key')) {
                this.errors['column'] = "'key' attribute not present.";
            }
            else {
                if (column['key'] != true) {
                    this.errors['column'] = "'key' is not true.";
                }
            }

            if (!column.hasOwnProperty('dataType')) {
                this.errors['column'] = "'dataType' attribute not present.";
            }
            else {
                if (column['dataType'] != 'code') {
                    this.errors['column'] = "'dataType' attribute is not a coding system.";
                }
            }

            // TODO: check domain and referencearea if needed

            return (Object.keys(this.errors).length === 0);
        }

        return FENIX_FX_MAP_Adapter;
    });