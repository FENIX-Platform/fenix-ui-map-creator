define([
    'jquery',
    'underscore',
    'loglevel',
    '../config/errors',
    '../config/events',
    '../config/config',
    './fenix-ui-map.src',
    'fenix-ui-pivotator',
    'fenix-ui-pivotator-utils',
    'amplify-pubsub'
], function ($, _, log, ERR, EVT, C, FM, Pivotator, Fenixtool, amplify) {

    'use strict';

    function MapCreator(o) {

        log.info("FENIX MapCreator");
        log.info(o);

        _.extend(this, C, {initial: o});

        require("../css/fenix-ui-map-creator.css");

        this._parseInput(o);

        this.fenix_ui_mapConfig = o.fenix_ui_map;

        var valid = this._validateInput();

        if (valid === true) {

            this._initVariables();

            this._bindEventListeners();

            this._renderMap();

            return this;

        } else {
            log.error("Impossible to create MapCreator");
            log.error(valid)
        }

    }

    // API

    /**
     * pub/sub
     * @return {Object} component instance
     */
    MapCreator.prototype.on = function (channel, fn, context) {
        var _context = context || this;
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }
        this.channels[channel].push({context: _context, callback: fn});
        return this;
    };

    /**
     * Add a base layer to map
     */
    MapCreator.prototype.addBaseLayer = function (layer) {

        this.fenixMap.addTileLayer(layer, true);

        return this;
    };
    /**
     * Add a layer to map
     */
    MapCreator.prototype.addLayer = function (model) {

        var layer;

        if (!model)
            return false;

        //support simple Leaflet layer
        if (model instanceof L.TileLayer)
            return this.fenixMap.map.addLayer(model);

        // TODO: switch to check if it's a fenix layer
        if (this.errors && (!model || !model.hasOwnProperty("metadata") ))
            this.errors.metadata = "Model does not contain 'metadata' attribute.";

        if (typeof model === 'string')
            layer = this.createLayerFenixUid(model);

        else if (model.hasOwnProperty('data'))
            layer = this.createLayerFenixJoin(model);

        else
            layer = this.createLayerFenix(model);

        layer = new FM.layer(layer);

        if (typeof model === 'object' && model['metadata'] && model['metadata']['title'] && model['metadata']['title']['EN'])
            layer.layer.layertitle = model['metadata']['title']['EN'];

        if (this.initial.legendtitle)
            layer.layer.layertitle = this.initial.legendtitle;

        this.fenixMap.addLayer(layer);

        return layer;
    };

    /**
     * Remove a layer from map
     */
    MapCreator.prototype.removeLayer = function (layer) {

        if (this.status.ready !== true) {
            return;
        }

        return this;
    };

    /**
     * Invalidate map size
     */
    MapCreator.prototype.invalidateSize = function () {

        if (this.status.ready !== true) {
            return;
        }

        this.fenixMap.invalidateSize()

        return this;
    };

    // end API

    MapCreator.prototype._parseInput = function () {

        this.id = this.initial.id;
        this.$el = $(this.initial.el);
        this.model = this.initial.model;

        //pivotator config
        var pc = {};

        pc.aggregationFn = this.initial.aggregationFn;

        pc.aggregations = this.initial.aggregations || [];
        pc.hidden = this.initial.hidden || [];
        pc.columns = this.initial.x;
        pc.values = this.initial.y || ["value"];
        pc.rows = this.initial.series;

        pc.formatter = this.initial.formatter || "value";
        pc.valueOutputType = this.initial.valueOutputType;
        pc.showRowHeaders = this.initial.showRowHeaders || false;
        pc.decimals = this.initial.decimals || 2;

        pc.showCode = this.initial.showCode || false;
        pc.showFlag = this.initial.showFlag || false;
        pc.showUnit = this.initial.showUnit || false;

        // add more pivotator config

        this.pivotatorConfig = pc;

    };

    MapCreator.prototype._validateInput = function () {

        var valid = true,
            errors = [];

        //set MapCreator id
        if (!this.id) {

            window.fx_map_id >= 0 ? window.fx_map_id++ : window.fx_map_id = 0;
            this.id = String(window.fx_map_id);
            log.warn("Impossible to find MapCreator id. Set auto id to: " + this.id);
        }

        //Check if $el exist
        if (this.$el.length === 0) {
            errors.push({code: ERR.MISSING_CONTAINER});
            log.warn("Impossible to find box container");
        }

        return errors.length > 0 ? errors : valid;

    };

    MapCreator.prototype._initVariables = function () {

        //pub/sub
        this.channels = {};

        this.status = {};
        this.status.ready = false;

        this.pivotator = new Pivotator();
        this.fenixTool = new Fenixtool();
    };

    MapCreator.prototype._bindEventListeners = function () {

        amplify.subscribe(this._getEventName(EVT.WINDOW_RESIZE), this, this.invalidateSize);
    };

    MapCreator.prototype._renderMap = function () {

        var self = this;

        //var myPivotatorConfig=this.fenixTool.parseInut(this.initial.model.metadata.dsd, this.pivotatorConfig);
        //var model = this.pivotator.pivot(this.model, this.pivotatorConfig);

        self.fenixMap = new FM.Map(self.$el, self.fenix_ui_mapConfig);
        self.fenixMap.createMap();

        self.leafletMap = self.fenixMap.map;

        if (self.model) {
            self.addLayer(self.model);
        }
        else if (this.initial.uid) {
            self.addLayer(this.initial.uid);
        }


        //TODO bind to Leaflet whenReady
        self.status.ready = true;  //To be set on map ready event

        setTimeout(_.bind(function () {
            self._trigger('ready');
        }, self), 0);
    };

    MapCreator.prototype._trigger = function (channel) {

        if (!this.channels[channel]) {
            return false;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = this.channels[channel].length; i < l; i++) {
            var subscription = this.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }

        return this;
    };

    MapCreator.prototype._getEventName = function (evt) {

        return this.id.concat(evt);

    };

    MapCreator.prototype._unbindEventListeners = function () {

        amplify.unsubscribe(this._getEventName(EVT.WINDOW_RESIZE), this.invalidateSize);
    };

    MapCreator.prototype.dispose = function () {

        //unbind event listeners
        this._unbindEventListeners();

        if (this.status.ready === true) {
            this.fenixMap.destroyMap();
        }

        this.$el.empty();

    };

    MapCreator.prototype.createLayerFenix = function (model, options) {
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

        layer.urlWMS = this.fenix_ui_map.DEFAULT_WMS_SERVER;
        layer.layertitle = {
            en: 'Data Layer'
        };
        layer.opacity = '0.9';
        return layer;
    };

    MapCreator.prototype.createLayerFenixUid = function (uid) {
        var layer = {
            urlWMS: this.DEFAULT_WMS_SERVER,
            layertitle: {
                en: 'Data Layer'
            },
            opacity: '0.9',
            layers: uid
        };
        return layer;
    };

    // JOIN
    MapCreator.prototype.createLayerFenixJoin = function (model) {

        if (this._validateJoinInput(model) === true) {

            // create the join layer
            var layer = this.getJoinLayer(model);

            _.extend(layer, this.join.style);

            var defPopup = "<div class='fm-popup'>{{" + layer.joincolumnlabel + "}}" +
                "<div class='fm-popup-join-content'>{{{" + layer.joincolumn + "}}} " +
                "{{measurementunit}}" +
                "</div></div>";


            // Layer title TODO: Add title if exist (check in the validator)
            if (model['metadata'].hasOwnProperty("title")) {
                if (model['metadata']['title'][this.lang]) {
                    layer.layertitle = model['metadata']['title'][this.lang];
                    //console.log('title',this.lang, layer.layertitle)
                }
            }
            else {
                layer.layertitle = model['metadata']['uid'];
            }

            // getting a title from the options
            if (this.hasOwnProperty('layer') && this.layer.hasOwnProperty('layertitle')) {
                layer.layertitle = this.layer.layertitle;
            }

            if (this.hasOwnProperty('layer') && this.layer.hasOwnProperty('popupBuilder')) {
                layer.popupBuilder = this.layer.popupBuilder;
            }

            layer.customgfi = {
                showpopup: true,
                content: {
                    EN: _.isFunction(layer.popupBuilder) ? layer.popupBuilder(layer.joincolumnlabel, layer.joincolumn) : defPopup
                }
            };

            // TODO: add check on the zoomto data (move it to a function)
            var codes = [];
            layer.joindata.forEach(function (code) {
                _.keys(code).forEach(function (key) {
                    if (_.isNumber(parseInt(key)))
                        codes.push(key);
                });
            });

            var zoomlayer = layer.layers.split(":");

            zoomlayer = zoomlayer.length > 1 ? zoomlayer[1] : zoomlayer[0];

            this.fenixMap.zoomTo(zoomlayer, layer.joincolumn, codes);

            if (this.initial.colorRamp)
                layer.colorramp = this.initial.colorRamp;

            return layer;

        } else {
            //console.error(this.errors);
            //throw new Error("FENIX Map creator has not a valid JOIN configuration");
        }
    };

    MapCreator.prototype.getJoinLayer = function (model) {

        var metadata = model['metadata'],
            geoColumn = {},
            valueColumn = {},
            muColumn = {};

        metadata['dsd']['columns'].forEach(_.bind(function (col, index) {
            if (col.subject === this.geoSubject || col.id === this.geoSubject) {
                geoColumn = col;
                geoColumn.index = index;
            }
            if (col.subject === this.valueSubject || col.id === this.valueSubject) {
                valueColumn = col;
                valueColumn.index = index;
            }
            if (col.subject === this.muSubject) {
                muColumn = col;
                muColumn.index = index;
            }
        }, this));

        // getting the right measurement unit if the new label exists
        metadata['dsd']['columns'].forEach(_.bind(function (column, index) {
            if (muColumn.id + '_' + this.lang) {
                muColumn = column;
                muColumn.index = index;
            }
        }, this));


        if (this._validateJoinColumnInput(geoColumn)) {


            var layer = null;
            var codelist = geoColumn['domain']['codes'][0]['idCodeList'].toLowerCase();

            if (this.join.layerMapping[codelist]) {
                layer = this.join.layerMapping[codelist];
            }
            else {
                geoColumn['domain']['codes'][0].idCodeList.toLowerCase();
                // TODO: Handle reference Area
                var referenceArea = metadata["meContent"]["seReferencePopulation"]["referenceArea"]['codes'][0].code.toLowerCase();
                layer = this.join.layerMapping[codelist + "_" + referenceArea];
            }

            // check measurementunit
            // TODO: Add measurement unit to the layer definition (using label column of the mu)

            // get joinData
            layer.joindata = this.getJoinData(model['data'], geoColumn.index, valueColumn.index);

            // TODO: check on the column index
            layer.measurementunit = model['data'][0][muColumn.index];

            // TODO: check if is the right legendtitle
            layer.legendtitle = layer.measurementunit;

            layer.layertitle = 'OCD';
            //layer.legendtitle = 'ODA';

            return layer;

        } else {
            console.error('Error JoinColumnInput not valid')
        }
    };

    MapCreator.prototype.getJoinData = function (data, geoColumnIndex, valueColumnIhdex) {
        var joindata = [];

        // TODO: remove cachedValues on final version. Check on join data consistency?
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

        return joindata;
    };

    MapCreator.prototype._validateJoinInput = function (model) {
        this.errors = {};

        //Metadata TODO: add all metadata checks
        if (!model.hasOwnProperty("metadata")) {
            this.errors.metadata = "'metadata' attribute not present.";
        }

        //Data
        if (!model.hasOwnProperty("data")) {
            this.errors.data = "'data' attribute not present.";
        }

        return (_.keys(this.errors).length === 0);
    };

    MapCreator.prototype._validateJoinColumnInput = function (column) {
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

    return MapCreator;
});