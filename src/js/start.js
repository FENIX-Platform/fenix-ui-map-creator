/*global define*/
define([
        'require',
        'jquery',
        'fx-m-c/templates/base_template',
        'fx-m-c/adapters/FENIX_fx_map'
    ],
    function (RequireJS, $) {

        var defaultOptions = {
            default: ''
        };

        function MapCreator() {
            $.extend(true, this, defaultOptions);
        }

        MapCreator.prototype.render = function (config) {
            if (this._validateInput(config)) {
                this.preloadResources(config);
            }
        };

        MapCreator.prototype.preloadResources = function ( config ) {

            var baseTemplate = this.getTemplateUrl(),
                adapter =  this.getAdapterUrl(),
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
            });
        };

        MapCreator.prototype.getAdapterUrl = function () {
            //TODO add here adapter discovery logic
            return this.adapterUrl ? this.adapterUrl : 'fx-m-c/adapters/FENIX_fx_map';
        };

        MapCreator.prototype.getTemplateUrl = function () {
            //TODO add here template discovery logic
            return this.templateUrl ? this.templateUrl : 'fx-m-c/templates/base_template';
        };

        MapCreator.prototype._validateInput = function () {
            return true;
        };

        // Handle Layers
        MapCreator.prototype.addLayer = function (model) {
            return this.adapter.addLayer(model)
        };

        MapCreator.prototype.removeLayer = function (model) {
            return this.adapter.removeLayer(model)
        };

        MapCreator.prototype.addCountryBoundaries = function () {
            return this.adapter.addCountryBoundaries()
        };

        MapCreator.prototype.invalidateSize = function () {
            return this.adapter.invalidateSize()
        };

        return MapCreator;
    });