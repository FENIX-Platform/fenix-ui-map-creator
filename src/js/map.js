/*global define, amplify*/
define([
    'jquery',
    'require',
    'underscore',
    'loglevel',
    'fx-m-c/config/errors',
    'fx-m-c/config/events',
    'fx-m-c/config/config',
    'fx-m-c/config/config-default',
    'fx-m-c/start',
    'fx-common/pivotator/start',
    'amplify'
], function ($, require, _, log, ERR, EVT, C, CD, Map, Pivotator) {

    'use strict';

    function MapCreator(o) {
        log.info("FENIX MapCreator");
        log.info(o);
console.log("init")
        $.extend(true, this, CD, C, {initial: o});

        this._parseInput(o);

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
     * @return {Object} MapCreator instance
     */
    MapCreator.prototype.on = function (channel, fn) {
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }
        this.channels[channel].push({context: this, callback: fn});
        return this;
    };

    /**
     * Add a base layer to map
     */
    MapCreator.prototype.addBaseLayer = function (layer) {

        if (this.status.ready !== true) {
            return;
        }

        return this._addBaseLayer(layer);
    };

    /**
     * Add a layer to map
     */
    MapCreator.prototype.addLayer = function (model, layerOptions, modelOptions) {

        if (this.status.ready !== true) {
            return;
        }

        return this._addLayer(model, layerOptions, modelOptions);
    };

    /**
     * Remove a layer from map
     */
    MapCreator.prototype.removeLayer = function (layer) {

        if (this.status.ready !== true) {
            return;
        }

        return this._removeLayer(layer);
    };

    /**
     * Invalidate map size
     */
    MapCreator.prototype.invalidateSize = function () {

        if (this.status.ready !== true) {
            return;
        }

        return this._invalidateSize();
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

    };

    MapCreator.prototype._bindEventListeners = function () {

        amplify.subscribe(this._getEventName(EVT.WINDOW_RESIZE), this, this.invalidateSize);
    };

    MapCreator.prototype._renderMap = function () {
console.log("this",this)
        var model = this.pivotator.pivot(this.model, this.pivotatorConfig);

        var config = $.extend(true, {}, {
            el: this.$el,
            model: model,
            lang: this.lang
        });

        //this.map = new Map(model) ...

        this.status.ready = true;  //To be set on map ready event

        this._trigger("ready");

    };

    // map methods

    MapCreator.prototype._removeLayer = function (layer) {
        return this.map.removeLayer(layer);
    };

    MapCreator.prototype._addBaseLayer = function (layer) {

        return this.map.addBaseLayer(layer);
    };

    MapCreator.prototype._addLayer = function (model, layerOptions, modelOptions) {
        return this.map.addLayer(model, layerOptions, modelOptions);
    };

    MapCreator.prototype._invalidateSize = function () {

        return this.map.invalidateSize();

    };

    // utils

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

    // disposition

    MapCreator.prototype._unbindEventListeners = function () {

        amplify.unsubscribe(this._getEventName(EVT.WINDOW_RESIZE), this.invalidateSize);
    };

    MapCreator.prototype.dispose = function () {

        //unbind event listeners
        this._unbindEventListeners();

        if (this.status.ready === true) {
            this.map.dispose();
        }

    };

    return MapCreator;
});