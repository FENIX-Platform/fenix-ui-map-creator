/*global define*/
define(['require',
        'jquery',
        'loglevel',
        'q',
       // 'fx-m-c/config/events',
        'fx-m-c/templates/base_template',
        'fx-m-c/adapters/FENIX_fx_map',
        'amplify'
    ],
    function (RequireJS, $, log, Q)
             // E)
    {

        'use strict';

        var defaultOptions = {
            default: ''
        };

        function MapCreator() {
            $.extend(true, this, defaultOptions);
            return this;
        }

        MapCreator.prototype.render = function (config) {
            this.deferred = Q.defer();

            try {
                if (this._validateInput(config)) {
                    this.preloadResources(config);

                    this.bindEventListeners();

                }
            }catch(e) {
                this.onError(e);
            }

            return this.deferred.promise;
        };

        MapCreator.prototype.preloadResources = function ( config ) {

            var baseTemplate = this.getTemplateUrl(),
                adapter =  this.getAdapterUrl((config.adapter) ? config.adapter.adapterType : null),
                self = this;

            RequireJS([
                baseTemplate,
                adapter
            ], function (Template, Adapter) {

                self.template = new Template();
                self.adapter = new Adapter();

                //currently both of them are sync fns
                self.template.render(config);
                self.adapter.render(config);

                if (typeof config.onReady === 'function') {
                    config.onReady(self);
                }

                self.deferred.resolve(self);
            });
        };

        MapCreator.prototype.getAdapterUrl = function (adapterType) {
            //TODO add here adapter discovery logic
            if (adapterType !== null && adapterType !== undefined) {
                switch (adapterType.toLocaleLowerCase()) {
                    case 'fenix':
                        return this.adapterUrl ? this.adapterUrl : 'fx-m-c/adapters/FENIX_fx_map';
              }
            }
            else {
                return this.adapterUrl ? this.adapterUrl : 'fx-m-c/adapters/FENIX_fx_map';
            }
        };

        MapCreator.prototype.getTemplateUrl = function () {
            //TODO add here template discovery logic
            return this.templateUrl ? this.templateUrl : 'fx-m-c/templates/base_template';
        };

        MapCreator.prototype._validateInput = function () {
            return true;
        };

        MapCreator.prototype.getContainer = function () {
            return this.template.container;
        };

        MapCreator.prototype.addBaseLayer = function (layer) {
            return this.adapter.addBaseLayer(layer);
        };

        // Handle Layers
        MapCreator.prototype.addLayer = function (model, layerOptions, modelOptions) {
            return this.adapter.addLayer(model, layerOptions, modelOptions);
        };

        MapCreator.prototype.removeLayer = function (layer) {
            return this.adapter.removeLayer(layer);
        };

        MapCreator.prototype.addCountryBoundaries = function () {
            return this.adapter.addCountryBoundaries();
        };

        MapCreator.prototype.invalidateSize = function () {

            log.info('invalidateSize', this.template.template.title)
            // dirty fix for invalidate size
            return this.adapter.invalidateSize();

        };

        MapCreator.prototype.bindEventListeners = function () {

            // amplify.subscribe(E.WINDOW_RESIZE, this, this.invalidateSize);

        };

        MapCreator.prototype.unbindEventListeners = function () {

            // amplify.unsubscribe(E.WINDOW_RESIZE, this, this.invalidateSize);

        };

        MapCreator.prototype.destroy = function () {

            //log.info('Map creator destroy ', this.template.template.title)

            this.unbindEventListeners();

        };

        return MapCreator;
    });