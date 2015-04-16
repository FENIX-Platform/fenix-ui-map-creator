/* 
 * fenix-ui-map v0.0.1 - 2015-04-16 
 * Copyright 2015  
 * FENIX Development Team 
 * 
 * Licensed under the GPL3 license. 
 * 
 * Source: 
 * https://github.com/FENIX-Platform/fenix-ui-map.git 
 */
var FM, originalFM;
if (!window.console) {var console = {};}
if (!console.log) {console.log = function() {};}
if (!console.warn) {console.warn = function() {};}
if (!console.error) {console.error = function() {};}
if (!console.info) {console.info = function() {};}

if (typeof exports !== undefined + '') {
    FM = exports;
} else {
    originalL = window.FM;
    FM = {};

    FM.noConflict = function () {
        window.FM = originalFM;
        return this;
    };
    window.FM = FM;
}

FM.version = '0.0.1';
FM.author = 'Simone Murzilli - simone.murzilli@gmail.com; simone.murzilli@fao.org';;
FM.Class = function () {};

FM.Class.extend = function (props) {

    // extended class with the new prototype
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        if (this._initHooks) {
            this.callInitHooks();
        }
    };

    // instantiate class without calling constructor
    var F = function () {};
    F.prototype = this.prototype;

    var proto = new F();
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        FM.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        FM.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (props.options && proto.options) {
        props.options = FM.extend({}, proto.options, props.options);
    }

    // mix given properties into the prototype
    FM.extend(proto, props);

    proto._initHooks = [];

    var parent = this;
    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parent.prototype.callInitHooks) {
            parent.prototype.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };

    return NewClass;
};


// method for adding properties to prototype
FM.Class.include = function (props) {
    FM.extend(this.prototype, props);
};

// merge new default options to the Class
FM.Class.mergeOptions = function (options) {
    FM.extend(this.prototype.options, options);
};

// add a constructor hook
FM.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};;
FM.Util = {

    initializeLangProperties: function(lang) {
        var I18NLang = '';

        //TODO swith to requirejs i18n
        //TODO lowercase lang code

        switch (lang) {
            case 'FR' : I18NLang = 'fr'; break;
            case 'ES' : I18NLang = 'es'; break;
            default: I18NLang = 'en'; break;
        }
        var path = FMCONFIG.BASEURL_LANG;

        $.i18n.properties({
            name: 'I18N',
            path: path,
            mode: 'both',
            language: I18NLang
        });
    },

    extend: function (dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;

        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    },

    bind: function (fn, obj) { // (Function, Object) -> Function
        var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function () {
            return fn.apply(obj, args || arguments);
        };
    },

    stamp: (function () {
        var lastId = 0, key = '_leaflet_id';
        return function (/*Object*/ obj) {
            obj[key] = obj[key] || ++lastId;
            return obj[key];
        };
    }()),

    limitExecByInterval: function (fn, time, context) {
        var lock, execOnUnlock;

        return function wrapperFn() {
            var args = arguments;

            if (lock) {
                execOnUnlock = true;
                return;
            }

            lock = true;

            setTimeout(function () {
                lock = false;

                if (execOnUnlock) {
                    wrapperFn.apply(context, args);
                    execOnUnlock = false;
                }
            }, time);

            fn.apply(context, args);
        };
    },

    falseFn: function () {
        return false;
    },

    formatNum: function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    },

    splitWords: function (str) {
        return str.replace(/^\s+|\s+$/g, '').split(/\s+/);
    },

    setOptions: function (obj, options) {
        obj.options = L.extend({}, obj.options, options);
        return obj.options;
    },

    getParamString: function (obj, existingUrl) {
        var params = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                params.push(i + '=' + obj[i]);
            }
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    },

    template: function (str, data) {
        return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
            var value = data[key];
            if (!data.hasOwnProperty(key)) {
                throw new Error('No value provided for variable ' + str);
            }
            return value;
        });
    },

    isArray: function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    },

    emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

    // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    function getPrefixed(name) {
        var i, fn,
            prefixes = ['webkit', 'moz', 'o', 'ms'];

        for (i = 0; i < prefixes.length && !fn; i++) {
            fn = window[prefixes[i] + name];
        }

        return fn;
    }

    var lastTime = 0;

    function timeoutDefer(fn) {
        var time = +new Date(),
            timeToCall = Math.max(0, 16 - (time - lastTime));

        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
    }

    var requestFn = window.requestAnimationFrame ||
        getPrefixed('RequestAnimationFrame') || timeoutDefer;

    var cancelFn = window.cancelAnimationFrame ||
        getPrefixed('CancelAnimationFrame') ||
        getPrefixed('CancelRequestAnimationFrame') ||
        function (id) { window.clearTimeout(id); };


    FM.Util.requestAnimFrame = function (fn, context, immediate, element) {
        fn = L.bind(fn, context);

        if (immediate && requestFn === timeoutDefer) {
            fn();
        } else {
            return requestFn.call(window, fn, element);
        }
    };

    FM.Util.cancelAnimFrame = function (id) {
        if (id) {
            cancelFn.call(window, id);
        }
    };

    /*FM.Util.replaceAll = function(text, stringToFind, stringToReplace) {
        var temp = text;
        var index = temp.indexOf(stringToFind);
        while(index != -1){
            temp = temp.replace(stringToFind,stringToReplace);
            index = temp.indexOf(stringToFind);
        }
        return temp;
    };   */

    FM.Util.replaceAll = function(text, stringToFind, stringToReplace) {
        return text.replace(new RegExp(stringToFind, 'g'), stringToReplace);
    },

    FM.Util.parseLayerRequest = function(layer) {
        var layerValues = eval(layer);
        var layerRequest = '';
        $.each(layerValues, function(key, value) {
            layerRequest += '&' + key + '=' + value;
        });
        return layerRequest;
    },

    FM.Util.randomID = function() {
        var randLetter = Math.random().toString(36).substring(7);
        return (randLetter + Date.now()).toLocaleLowerCase();
    },

    FM.Util.fire = function(item , type, data){
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(type, true, true, data);
        item.dispatchEvent(evt);
    }

    FM.Util.on = function(item , type, data, callback){
        item.addEventListener(type, callback, false);
    }

}());

// shortcuts for most used utility functions
FM.extend = FM.Util.extend;
FM.bind = FM.Util.bind;
FM.stamp = FM.Util.stamp;
FM.setOptions = FM.Util.setOptions;
FM.replaceAll = FM.Util.replaceAll;
FM.loadModuleLibs = FM.Util.loadModuleLibs;
FM.initializeLangProperties = FM.Util.initializeLangProperties;;
;(function(exports){
	
	function HashMap() {
		this.clear();
	};

	HashMap.prototype = {
		constructor:HashMap,

		get:function(key) {
			var data = this._data[this.hash(key)];
			return data && data[1];
		},
		
		set:function(key, value) {
			// Store original key as well (for iteration)
			this._data[this.hash(key)] = [key, value];
		},
		
		has:function(key) {
			return this.hash(key) in this._data;
		},
		
		remove:function(key) {
			delete this._data[this.hash(key)];
		},

		type:function(key) {
			var str = Object.prototype.toString.call(key);
			var type = str.slice(8, -1).toLowerCase();
			// Some browsers yield DOMWindow for null and undefined, works fine on Node
			if (type === 'domwindow' && !key) {
				return key + '';
			}
			return type;
		},

		count:function() {
			var n = 0;
			for (var key in this._data) {
				n++;
			}
			return n;
		},

		clear:function() {
			// TODO: Would Object.create(null) make any difference
			this._data = {};
		},

		hash:function(key) {
			switch (this.type(key)) {
				case 'undefined':
				case 'null':
				case 'boolean':
				case 'number':
				case 'regexp':
					return key + '';

				case 'date':
					return ':' + key.getTime();

				case 'string':
					return '"' + key;

				case 'array':
					var hashes = [];
					for (var i = 0; i < key.length; i++)
						hashes[i] = this.hash(key[i]);
					return '[' + hashes.join('|');

				case 'object':
				default:
					// TODO: Don't use expandos when Object.defineProperty is not available?
					if (!key._hmuid_) {
						key._hmuid_ = ++HashMap.uid;
						hide(key, '_hmuid_');
					}

					return '{' + key._hmuid_;
			}
		},

		forEach:function(func) {
			for (var key in this._data) {
				var data = this._data[key];
				func(data[1], data[0]);
			}
		}
	};

	HashMap.uid = 0;

	
	function hide(obj, prop) {
		// Make non iterable if supported
		if (Object.defineProperty) {
			Object.defineProperty(obj, prop, {enumerable:false});
		}
	};

	exports.HashMap = HashMap;

})(this.exports || this);;
FM.UIUtils = {

    fullscreen: function (idButton, idFullscreen) {

        var fsElement = document.getElementById(idFullscreen);

        if (window.fullScreenApi.supportsFullScreen) {
            $('#' + idButton).on('click', function () {
                window.fullScreenApi.requestFullScreen(fsElement);
            });
        } else {
            //alert('is not supported the full screen on your browser')
        }
    },

    loadingPanel: function (id, height) {
        var h = '25px';
        if ( height ) document.getElementById(id).innerHTML = "<div class='fm-loadingPanel' style='height:"+ h +"'></div>";
        else document.getElementById(id).innerHTML = "<div class='fm-loadingPanel'></div>";
//        document.getElementById(id).innerHTML = "<div class='fm-loadingPanel' style='height:"+ h +"'><img src='"+ FMCONFIG.BASEURL +'/images/loading.gif' +"'></div>";
    }


};

$.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone();
        var copy_from = $(this).clone();
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};


;
FM.WMSUtils = FM.Class.extend({

    /** TODO: implement WFS **/

    _divID:'',
    _dropdowndID: '',
    _outputID: '',
    _fenixMap: '',
    _wmsServers: '',
    _mapID: '',
    _lang: 'EN',

    // JSON
    WMSCapabilities: function(divID, outputID, fenixmap, wmsServers, lang) {
        this._divID = divID;
        this._dropdowndID = divID + '-dropdown';
        this._outputID = outputID;
        this._fenixmap = fenixmap;
        this._wmsServers = wmsServers;
        if ( lang ) this._lang = lang;

        this._createWMSDropDown(this._wmsServers, this._divID, this._dropdowndID, this._outputID, fenixmap);
    },

    _createWMSDropDown: function(wmsServers, divID, dropdowndID, outputID, fenixmap) {
        // TODO: dynamic width
        var html = '<select id="'+ dropdowndID+'" style="width:200px;" data-placeholder="'+ $.i18n.prop('_selectaWMSServer') +'" class="">';
        html += '<option value=""></option>';
        for(var i=0; i < wmsServers.length; i++)
            html += '<option value="'+ wmsServers[i].url + '">'+wmsServers[i].label +'</option>';
        html += '</select>';

        $('#' + divID).empty();
        $('#' + divID).append(html);

        try {
            $('#' + dropdowndID).chosen({disable_search_threshold:6, width: '100%'});
        }  catch (e) {}

        // enable on click
        var _this = this;
        $( "#" + dropdowndID ).change({},  function (event) {
            _this._createWMSOutputRequest(outputID, fenixmap, $( this ).val());
        });
    },

    /**
     * Create Layers's List
     *
     * @param id
     * @param fenixmap
     * @param wmsServerURL
     * @param urlOptions
     * @private
     */
     /** TODO: urlOptions (urlParameters) non e' usato!!! **/
    _createWMSOutputRequest: function(id, fenixmap, wmsServerURL) {
        $("#" + id).empty();
        FM.UIUtils.loadingPanel(id, '30px');

        var url = FMCONFIG.BASEURL_MAPS  + FMCONFIG.MAP_SERVICE_WMS_GET_CAPABILITIES;
        url += (url.indexOf('?') > 0)? "&": "?";
        url += 'SERVICE=WMS';
        url += '&VERSION=1.1.1';
        url += '&request=GetCapabilities';
        url += '&urlWMS=' + wmsServerURL;

         var _this = this;
         $.ajax({
             type: "GET",
             url: url,
             success: function(response) {
                 var xmlResponse = $.parseXML( response );
                 _this._createWMSOutput(id, fenixmap, xmlResponse, wmsServerURL)
             }
         });
    },

    _createWMSOutput: function(id, fenixmap, xmlResponse, wmsServerURL ) {

        $("#" + id).empty();
        $(xmlResponse).find('Layer').each(function() {

            if ($(this).children("Name").text() && $(this).children("Name").text() != '') {

                var layer = {};
                layer.layers= $(this).children("Name").text();
                layer.layername= $(this).children("Name").text();
                layer.layertitle=$(this).children("Title").text();

                //TODO: dirty quick TITLE fix for DEMO
                layer.layertitle = layer.layertitle.replace(/_/g,' ');
                layer.layertitle = layer.layertitle.replace(/3857/g,' ');

                layer.styles = $(this).children("Style").children("Name").text();
                layer.urlWMS = wmsServerURL;
                // setting the default CRS of the map
                layer.srs = fenixmap.map.options.crs.code;
                layer.openlegend = true; //this will open the legend by on preview (choose on add if we want to leave it open **/


                var rand = FM.Util.randomID();
                var layerPanel = FM.replaceAll(FM.guiController.wmsLoaderLayer, 'REPLACE', rand);

                $("#" + id).append(layerPanel);
                $('#' + rand + '-WMSLayer-title').append(layer.layertitle);
                $('#' + rand + '-WMSLayer-title').attr( "title",layer.layertitle);
                try { $('#' + rand + '-WMSLayer-title').powerTip({placement: 'n'}); } catch (e) {}


                // TODO: get bounding box with the current CRS
                $("#" + rand + "-WMSLayer-box").click({fenixmap:fenixmap, layer: layer}, function(event) {
                    event.data.layer.openlegend = false; // if on add we want to close the legend
                    var layer = new FM.layer(event.data.layer);
                    event.data.fenixmap.addLayer(layer);

                    // TODO: multilanguage PopUp onAdd
                    var content = 'The Layer <b>' + event.data.layer.layertitle + '</b><br> has been added to the map';
                    try {
                        FMPopUp.init({parentID: event.data.fenixmap.id, content: content})
                    }catch(e) {}

                });

                // add on hoverIntent the layer
                var _fenixMap = fenixmap;
                var _layer =  $.extend(true, {}, layer);
                //_layer.hideLayerInControllerList = true;
                var _tmpLayer = new FM.layer(_layer);
                try {
                    $("#" + rand + "-WMSLayer-box").hoverIntent({
                        over: function () { _fenixMap.addLayer(_tmpLayer);},
                        out:  function () { _fenixMap.removeLayer(_tmpLayer);},
                        timeout: 500
                    });
                }catch(e) {
                    // try catch in case the jquery.hoverIntent plugin is not been imported
                }
            }
        });
    },

    // add a new Server to the servers list
    addWMSServer: function() {

    },


    _WMSCapabilities: function(id, fenixmap, wmsServerURL) {
        // TODO: check it because in theory it shouldn't be needed
        var url = FMCONFIG.BASEURL_MAPS  + FMCONFIG.MAP_SERVICE_WMS_GET_CAPABILITIES;
        url += (url.indexOf('?') > 0)? "&": "?";
        url += 'SERVICE=WMS';
        url += '&VERSION=1.1.1';
        url += '&request=GetCapabilities';
        url += '&urlWMS=' + wmsServerURL;

        var _this = this;
        $.ajax({
            type: "GET",
            url: url,
            success: function(response) {
                var xmlResponse = $.parseXML(response);
                _this._createWMSDropwDown(id, fenixmap, xmlResponse, wmsServerURL)
            }
        });
    },

    _createWMSDropwDown: function(id, fenixmap, xmlResponse, wmsServerURL ) {
        var rand = FM.Util.randomID();
        $(xmlResponse).find('Layer').each(function() {
            var rand = FM.Util.randomID();
            if ($(this).children("Name").text()) {

                var layer = {};
                layer.layers = $(this).children("Name").text();
                layer.layername = $(this).children("Name").text();
                layer.layertitle =$(this).children("Title").text();
                layer.styles = $(this).children("Style").children("Name").text();
                layer.urlWMS = wmsServerURL;
                layer.openlegend = true;

                $("#" + id).append("<div id='WMSLayer-"+ rand +"'>ddd" + layer.layertitle + " + " +  layer.styles + " <div>");

                // setting the default CRS of the map
                layer.srs = fenixmap.map.options.crs.code;

                $("#WMSLayer-" + rand).click({fenixmap:fenixmap, layer: layer}, function(event) {
                    var layer = new FM.layer(event.data.layer);
                    event.data.fenixmap.addLayerWMS(layer);
                });
            }
        });
    },


    WFSCapabilities: function(id, fenixmap, wmsServerURL) {
        var url = FMCONFIG.BASEURL_MAPS  + FMCONFIG.MAP_SERVICE_WMS_GET_CAPABILITIES;
        url += (url.indexOf('?') > 0)? "&": "?";
        url += 'SERVICE=WFS';
        url += '&VERSION=1.0.0';
        url += '&request=GetCapabilities';
        url += '&urlWMS=' + wmsServerURL;

        var _this = this;
        $.ajax({
            type: "GET",
            url: url,
            success: function(response) {
                var xmlResponse = $.parseXML(response);
                FM.WMSUtils._createWMSDropwDown(id, fenixmap, xmlResponse, wmsServerURL)
            }
        });
    },

    _createWFSDropwDown: function(id, fenixmap, xmlResponse, wmsServerURL ) {
        $(xmlResponse).find('Layer').each(function() {
            /** TODO: optimize ramdon function **/
            var rand = FM.Util.randomID();
            if ($(this).children("Name").text()) {

                //console.log($(this).children("Name").text() + ' | ' +  $(this).children("Title").text());
                $("#" + id).append("<div id='WMSLayer-"+ rand +"'>" + $(this).children("Title").text() + " + " +  $(this).children("Style").children("Name").text() + " <div>");
                //$("#" + id).append("<li> <a href='#'>" + $(this).children("Title").text() + " + " +  $(this).children("Style").children("Name").text() + "</a><li>");

                var layer = {};
                layer.layers= $(this).children("Name").text();
                layer.layername= $(this).children("Name").text();
                layer.layertitle=$(this).children("Title").text();
                layer.style = $(this).children("Style").children("Name").text();
                layer.urlWMS = wmsServerURL;
                layer.openlegend = true;

                // setting the default CRS of the map
                layer.srs = fenixmap.map.options.crs.code;

                $("#WMSLayer-" + rand).click({fenixmap:fenixmap, layer: layer}, function(event) {
                    var layer = new FM.layer(event.data.layer);
                    event.data.fenixmap.addLayerWMS(layer);
                });
            }
        });
    }
});;
(function() {
    var
        fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');

    // check for native support
    if (typeof document.exitFullscreen != 'undefined') {
        //console.log('fullScreenApi if');
        fullScreenApi.supportsFullScreen = true;
    } else {
       // console.log('fullScreenApi else');
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                //console.log('fullScreenApi.CancelFullScreen');
                fullScreenApi.supportsFullScreen = true;
                break;
            }
        }
    }

    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        //console.log('fullScreenApi.qua');
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

        fullScreenApi.isFullScreen = function() {
            //console.log('fullScreenApi.isFullScreen');
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function(el) {
            //console.log('fullScreenApi.requestFullScreen');
            return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function(el) {
           // console.log('fullScreenApi.cancelFullScreen');
                return (this.prefix === '') ?
                document.exitFullscreen() :
                document[this.prefix + 'CancelFullScreen']();
        }
    }

    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function() {

            return this.each(function() {
                var el = jQuery(this);
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.requestFullScreen(el);
                }
            });
        };
    }

    // export api
    window.fullScreenApi = fullScreenApi;
})();;
FM.DEPENDENCIES = {

    FENIX_REPOSITORY: "fenixapps.fao.org/repository",

    fenixmap: {
        js: [
            "http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js",
            "http://fenixapps.fao.org/repository/js/jquery/1.9.1/jquery.min.js",
            "http://fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min.js",
            "http://code.jquery.com/ui/1.10.3/jquery-ui.js",
            "http://fenixapps.fao.org/repository/js/jquery.power.tip/1.2.0/jquery.powertip.min.js",
            "http://fenixapps.fao.org/repository/js/FENIX/utils/import-dependencies-1.0.js",
            "http://hqlprfenixapp2.hq.un.fao.org:13000/repository/js/jquery.pageslide/2.0/jquery.pageslide.min.js",
            // change with library
            "js/FENIXMap.js",
            "js/core/Class.js",
            "js/core/Util.js",
            "js/core/hashmap.js",
            "js/map/config/CONFIG.js",
            "js/map/config/DEPENDENCIES.js",
            "js/map/Map.js",
            "js/map/controller/MapController.js",
            "js/map/layer/Layer.js",
            "js/map/layer/TileLayer.js",
            "js/map/constants/TILELAYER.js",
            "js/map/gui/gui-controller.js",
            "js/map/gui/gui-map.js",
            "js/core/fullscreen.js",
            "js/core/UIUtils.js"

        ],
        css: [
//            "<link rel=\"stylesheet\" href=\"http://cdn.leafletjs.com/leaflet-0.6.4/leaflet-custom.css\" /><!--[if lte IE 8]><link rel=\"stylesheet\" href=\"http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.ie.css\" /><![endif]-->"
            "http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css",
            "http://fenixapps.fao.org/repository/js/jquery.power.tip/1.2.0/css/jquery.powertip.css",
            "http://hqlprfenixapp2.hq.un.fao.org:13000/repository/js/jquery.pageslide/2.0/jquery.pageslide.min.css",
            "css/fenix-map.css"
        ]
    },

    geocoder : {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.geocoder/1.0/Control.OSMGeocoder.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.geocoder/1.0/Control.OSMGeocoder.css"
        ]
    },

    geosearch: {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.geosearch/1.0/l.control.geosearch.js",
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.geosearch/1.0/l.geosearch.provider.openstreetmap.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.geosearch/1.0/l.geosearch.css"
        ]
    },

    mouseposition: {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.mouseposition/1.0/L.Control.MousePosition.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.mouseposition/1.0/L.Control.MousePosition.css"
        ]
    },

    drawcontrol: {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.draw/1.0/leaflet.draw.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.draw/1.0/leaflet.draw.css"
        ]
    },

    exportplugin: {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.export/1.0/export.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.export/1.0/export.css"
        ]
    },

    controlloading: {
        js : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.control.loading/1.0/Control.Loading.js"
        ],
        css : [
            "http://fenixapps.fao.org/repository/js/leaflet/plugins/leaflet.control.loading/1.0/Control.Loading.css"
        ]
    }
};
;
FMDEFAULTLAYER = {

    getLayer: function(layertype, isjoin, measurementunit) {
        switch(layertype.toUpperCase()) {
            case "GAUL0"                : return FMDEFAULTLAYER._getGAUL('gaul0_faostat_3857_2', 'adm0_code', 'the_geom', isjoin, 'faost_n', measurementunit, 'GAUL'); break;
            case "GAUL0_FAOSTAT"        : return FMDEFAULTLAYER._getGAUL('gaul0_faostat_3857', 'faost_code','the_geom', isjoin, 'faost_n', measurementunit, 'FAOSTAT'); break;
            case "GAUL0_ISO2"           : return FMDEFAULTLAYER._getGAUL('gaul0_faostat_3857_2', 'iso2_code', 'the_geom', isjoin, 'faost_n', measurementunit, 'ISO2'); break;
            case "GAUL0_ISO3"           : return FMDEFAULTLAYER._getGAUL('gaul0_faostat_3857_2', 'iso3_code', 'the_geom', isjoin, 'faost_n', measurementunit, 'ISO3'); break;
            case "GAUL0_BOUNDARIES"     : return FMDEFAULTLAYER._getWMSLayer('gaul0_line_3857'); break;
            case "GAUL1"                : return FMDEFAULTLAYER._getGAUL('gaul1_3857', 'adm1_code', 'the_geom', isjoin, 'adm1_name', measurementunit, null); break;
//            case "GAUL1"                : return FMDEFAULTLAYER._getGAUL('gaul1_3857', 'adm1_code', 'the_geom', isjoin, 'adm1_name', measurementunit, null); break;
//            case "GAUL2"                : return FMDEFAULTLAYER._getGAUL('gaul2_3857', 'adm2_code', 'the_geom', isjoin, 'adm2_name', measurementunit, null); break;
            // TODO: change to a standard GAUL2 layer. 'gaul2_3857_2'is another GAUL2 used with the new popup (the old gaul2 as content.ftl used by countrystat)
            case "GAUL2"                : return FMDEFAULTLAYER._getGAUL('gaul2_3857', 'adm2_code', 'the_geom', isjoin, 'adm2_name', measurementunit, null); break;
        }
    },

    _getGAUL: function(layername, joincolumn, geometrycolumn, isjoin, joincolumnlabel, measurementunit, joinboundary) {
        var layer = {};
        layer.layers=layername ;
        layer.styles='';
        layer.joincolumn=(joincolumn )? joincolumn: null;
        layer.joincolumnlabel=(joincolumnlabel )? joincolumnlabel: null;
        layer.measurementunit=(measurementunit )? measurementunit: null;
        layer.srs = 'EPSG:3857';
        layer.geometrycolumn =(geometrycolumn )? geometrycolumn: '';
        if (isjoin) {
            FMDEFAULTLAYER.joinDefaultPopUp(layer);
            layer.joinboundary = joinboundary;
        }
        return layer;
    },

    _getWMSLayer:function(layername, urlWMS, styles, srs) {
        // TODO: remove FMCONFIG from here!
        var layer = {};
        layer.layers = layername;
        layer.styles = (styles)?styles:'';
        layer.srs = (srs)?srs:'EPSG:3857';
        layer.urlWMS = (urlWMS)?urlWMS: FMCONFIG.DEFAULT_WMS_SERVER;
        return layer;
    },

    /** TODO: handle multilanguage **/
    joinDefaultPopUp: function( layer ) {
        //console.log(layer);
        var measurementunit  = (layer.measurementunit)? " " + layer.measurementunit +"": "";
        var joinlabel  = (layer.joincolumnlabel)? "<div class='fm-popup-join-title'>{{" + layer.joincolumnlabel +"}}</div>": "";
        layer.customgfi = {
            content : {
                en: "<div class='fm-popup'>" + joinlabel + "<div class='fm-popup-join-content'>{{{" + layer.joincolumn +"}}} <i>" + measurementunit +"</i></div></div>",
                fr: "<div class='fm-popup'>" + joinlabel + "{{{" + layer.joincolumn +"}}} <i>" + measurementunit +"</i></div>",
                es: "<div class='fm-popup'>" + joinlabel + "{{{" + layer.joincolumn +"}}} <i>" + measurementunit +"</i></div>"
            }
            ,showpopup: true
            ,output: {
                show: true,
                id: 'gfiid'
            }
            ,callback : function(response, custompopup) {
                $('#' + custompopup.outputid ).empty();
                $('#' + custompopup.outputid ).append(response);
            }
        }
    }

};
;
FM.TILELAYER = {

    // OpenStreetMap
    OSM: {
        URL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        TITLE_EN: 'OSM - OpenStreetMap',
        TITLE_FR: 'OSM - OpenStreetMap'
    },

    OSM_GRAYSCALE: {
        URL : 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
        TITLE_EN: 'OSM - OpenStreetMap grayscale',
        TITLE_FR: 'OSM - OpenStreetMap grayscale'
    },

    MAPQUEST: {
        URL : 'http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
        TITLE_EN: 'MapQuest'
    },

    MAPQUEST_NASA_AERIAL : {
        URL: 'http://tile21.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
        TITLE_EN: 'MapQuest Aerial'
    },

    ESRI_WORLDSTREETMAP : {
        URL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png',
        TITLE_EN: 'ESRI - World Street Map',
        TITLE_FR:  'ESRI - World Street Map'
    },

    ESRI_WORLDTERRAINBASE : {
        URL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
        TITLE_EN: 'ESRI - World Terrain Base',
        TITLE_FR: 'ESRI - World Terrain Base'
    },

    ACETATE_LABELS : {
        URL : 'http://a{s}.acetate.geoiq.com/tiles/acetate-labels/{z}/{x}/{y}.png',
        TITLE_EN : 'Acetate Labels'
    },

    ACETATE_TERRAIN : {
        URL : 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png',
        TITLE_EN: 'Acetate Terrain'
    },

    STAMEN_TONER_BACKGROUND : {
        URL : 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png',
        TITLE_EN: 'Stamen'
    },

    ESRI_HISTORICAL_MERCATOR: {
        URL : 'http://tiles2.arcgis.com/tiles/IEuSomXfi6iB7a25/arcgis/rest/services/World_Globe_1812/MapServer/{z}/{x}/{y}.png',
        TITLE_EN: 'ESRI_HISTORICAL_MERCATOR'
    }
};
;
FM.WMSSERVERS = {

    DEFAULT_EXTERNAL_WMS_SERVERS: [
        {
            label: 'FENIX Crops Area',
            label_EN: 'FENIX', // not currently used for the multilingual, it is needed?
            url: 'http://fenix.fao.org/demo/fenix/geoserver/earthstat/wms'
        },
//        {
//            label: 'FENIX WMS Server',
//            label_EN: 'FENIX', // not currently used for the multilingual, it is needed?
//            url: 'http://fenixapps.fao.org/geoserver'
//        },
        {
            label: 'DATA.FAO.ORG',
            label_EN: 'data.fao.org WMS Server',
            //url: 'http://data.fao.org/maps/wms?AUTHKEY=d30aebf0-ab2a-11e1-afa6-0800200c9a66'
            url: 'http://data.fao.org/maps/wms'
        },
        {
            label: 'UNREDD Congo',
            label_EN: 'UNREDD Congo',
            url: 'http://rdc-snsf.org/diss_geoserver/gwc/service/wms'
        },
        {
            label: 'Wales OpenData',
            label_EN:  'Wales OpenData',
            url: 'http://inspire.wales.gov.uk/maps/ows'
        },
        {
            label: 'Scotland OpenData',
            label_EN:  'Scotland OpenData',
            url: 'http://sedsh127.sedsh.gov.uk/arcgis/services/ScotGov/StatisticalUnits/MapServer/WMSServer'
        },
        {
            label: 'Netherlands OpenData',
            label_EN:  'Netherlands OpenData',
            url: 'http://geodata.nationaalgeoregister.nl/ahn2/wcs'
        },
        {
            label: 'German OpenData',
            label_EN:  'German OpenData',
            url: 'http://geo.sv.rostock.de/geodienste/verwaltung/wms'
        },
//        {
//            label: 'De Agostini of',
//            label_EN:  'De Agostini',
//            url: 'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/de_agostini.map'
//        },
        {
            label: 'ENVIRONMENT OpenData',
            label_EN:  'Scotland OpenData',
            url: 'http://lasigpublic.nerc-lancaster.ac.uk/ArcGIS/services/Biodiversity/GMFarmEvaluation/MapServer/WMSServer'
        },
        {
            label: 'OpenGeo Demo Server',
            label_EN: 'OpenGeo Demo Server',
            url: 'http://demo.opengeo.org/geoserver/ows'
        },
        //{
        //    label: 'HarvestChoice 1',
        //    label_EN: 'HarvestChoice 1',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_1/MapServer/WMSServer'
        //},
        //{
        //    label: 'HarvestChoice 2',
        //    label_EN: 'HarvestChoice 2',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_2/MapServer/WMSServer'
        //},
        //{
        //    label: 'HarvestChoice 3',
        //    label_EN: 'HarvestChoice 3',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_3/MapServer/WMSServer'
        //},
        //{
        //    label: 'HarvestChoice 4',
        //    label_EN: 'HarvestChoice 4',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_4/MapServer/WMSServer'
        //},
        //{
        //    label: 'HarvestChoice 5',
        //    label_EN: 'HarvestChoice 5',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_5/MapServer/WMSServer'
        //},
        //{
        //    label: 'HarvestChoice 6',
        //    label_EN: 'HarvestChoice 6',
        //    url: 'http://apps.harvestchoice.org/arcgis/services/MapServices/cell_values_6/MapServer/WMSServer'
        //},
        {
            label: 'Alberts Map Service',
            url: 'http://maps.gov.bc.ca/arcserver/services/Province/albers_cache/MapServer/WMSServer',
            urlParameters: 'service=WMS'  // used as additional parameters
        },
        {
            label: 'Cubert Map Service',
            label_EN: 'Cubert',
            url: 'http://portal.cubewerx.com/cubewerx/cubeserv/cubeserv.cgi'
        },
        {
            label: 'GP Map Service',
            label_EN: 'gp map service201',
            url: 'http://geoportal.logcluster.org:8081/gp_map_service201/wms'
        },
        {
            label: 'Vienna OpenData',
            label_EN:  'Vienna OpenData',
            url: 'http://data.wien.gv.at/daten/wms'
        },
        {
            label: 'Vienna OpenData',
            label_EN:  'Vienna OpenData',
            url: 'http://data.wien.gv.at/daten/wms'
        }
        /*,
        {
            label: 'toscana',
            label_EN: 'Cubewerx Map Service',
            url: 'http://eusoils.jrc.ec.europa.eu/wrb/wms_Threats.asp'
        }*/


/*        ,{
            label: 'OCHA Map Service',
            label_EN: 'OCHA Map Service',
            url: 'http://carto.iict.ch/geoserver/wms',
            urlParameters: 'service=WMS'  // used as additional parameters
        }*/

    ]
}

;
FM.Map = FM.Class.extend({

    id: '',
    suffix: '',
    mapContainerID: '',
    tilePaneID: '',

    map: '', // this is the map obj of Leaflet/Openlayers
    controller : '', // controller of the map

    mapOptions: {
        center: [0, 0],
        lat: 0,
        lng: 0,
        zoom: 1
    },
    options: {
        guiController : {
            enablegfi: true // this is used to switch off events like on drawing (when is need to stop the events on GFI)
        },
        gui : {
            fullscreen: true,
            fullscreenID: '' //TODO: pass it or
            // TODO: pass fullscreen content ID on a fullscreen object instead of like that
        },
        usedefaultbaselayers: true,
        lang: 'EN',
        url: {}
    },

    initialize: function(id, options, mapOptions) { // (HTMLElement or String, Object)
        // merging object with a deep copy
        this.options =  $.extend(true, {}, this.options, options);
        this.mapOptions = $.extend(true, {}, this.mapOptions, mapOptions);

        // extent if exist FM.CONFIG
        if (FMCONFIG) {
            this.options.url = $.extend(true, {}, FMCONFIG, options.url);
        }

        // setting up the lang properties
        FM.initializeLangProperties(this.options.lang);

        var suffix = FM.Util.randomID();
        var mapContainerID =  suffix + '-container-map';
        var mapID =  suffix + '-map';
        
        $(id).append("<div class='fm-map-box fm-box' id='"+ mapContainerID +"'><div>");
        $("#" + mapContainerID).append("<div style='width:100%; height: 100%;' id='"+ mapID +"'><div>");

        this.id = mapID;
        this.mapContainerID = mapContainerID;
        this.suffix = suffix;

        // fullscreen
        this.options.gui.fullscreenID = ( this.options.gui.fullscreenID != '')? this.options.gui.fullscreenID: this.mapContainerID;
        this.map = new L.Map(this.id, this.mapOptions);

        // setting the TilePaneID   TODO: set IDs to all the DIVs?
        this.setTilePaneID();

        // TODO: put in options the fact to add a controller or not
        $("#" + mapContainerID).append("<div style='width:350px;' id='"+ suffix +"-controller'><div>");

        this.controller = new FM.mapController(suffix, this, this.map,  this.options.guiController);
        this.controller.initializeGUI();

        var _this = this;
        this.map._fenixMap = this;
        // TODO: boolean to see if GFI is allowed
        this.map.on('click', function (e) {
            if ( _this.options.guiController.enablegfi ) _this.getFeatureInfo(e);
        });

        // popup hovervalue
        $("#" + mapContainerID).append("<div id='"+ suffix +"-popup'><div>");

        // swipe id (TODO: replace with the new swipe)
        $("#" + mapContainerID).append("<div  class='fm-swipe' id='"+ suffix +"-swipe'><div style='display:none' class='fm-swipe-handle'id='"+ suffix +"-handle'>&nbsp</div></div>");

        // join popup holder
        $("#" + mapContainerID).append(FM.replaceAll(FM.guiController.popUpJoinPoint, 'REPLACE', suffix));

        /**  listener test
        this.map.on('data:loaded', function (e) {
            // Fit bounds after loading
        }, this);

        this.map.fire('data:loaded', {layer: 'test'});
        **/

    },

    createMap: function(lat, lng, zoom){
        if ( lat )  this.mapOptions.lat = lat;
        if ( lng )   this.mapOptions.lng = lng;
        if ( zoom ) this.mapOptions.zoom = zoom;
        this.map.setView(new L.LatLng(this.mapOptions.lat, this.mapOptions.lng), this.mapOptions.zoom);
        L.control.scale('bottomright').addTo(this.map);
        this.initializePlugins();
        this.initializeMapGUI();
        if ( this.options.usedefaultbaselayers ) this._addDefaultBaseLayers();

        $("#" + this.id + " .leaflet-control-zoom-in").html("")
        $("#" + this.id + " .leaflet-control-zoom-out").html("")
    },

    /** Default Baselayers loaded at startup if they are not override **/
    _addDefaultBaseLayers: function() {
        this.addTileLayer(FM.TileLayer.createBaseLayer('OSM', 'EN'), true);
        this.addTileLayer(FM.TileLayer.createBaseLayer('OSM_GRAYSCALE', 'EN'), true);
        this.addTileLayer(FM.TileLayer.createBaseLayer('ESRI_WORLDSTREETMAP', 'EN'), true);
        this.addTileLayer(FM.TileLayer.createBaseLayer('ESRI_WORLDTERRAINBASE', 'EN'), true);
    },

    /** TODO: make it nicer **/
    setTilePaneID: function() {
        this.tilePaneID = this.suffix + '-leaflet-tile-pane';
        var childNodes = document.getElementById(this.id).childNodes;
        var childNodes2 = childNodes[1].childNodes;
        $(childNodes2[0]).attr("id", this.tilePaneID);
    },

    addTileLayer: function(l, isBaseLayer) {
        if ( isBaseLayer ) this.controller.addBaseLayer(l);
        else  {
           this.controller.layerAdded(l);
           this.map.addLayer(l.leafletLayer);
        }
        this.controller.setZIndex(l);
    },

    /** TODO: make it nicer **/
    addLayer:function (l) {
        l._fenixmap = this;
        if (l.layer.layertype ) {
           switch(l.layer.layertype ) {
               case 'JOIN':
                   if (l.layer.jointype.toLocaleUpperCase() == 'SHADED') this.addShadedLayer(l);
                   else if (l.layer.jointype.toLocaleUpperCase() == 'POINT') this.addPointLayer(l);
               break;
               case 'WMS': this.addLayerWMS(l); break;
               default: this.addLayerWMS(l); break;
           }
        }
        else {
           /* DEFAULT request**/
           this.addLayerWMS(l);
        }
    },

    removeLayer:function(l) {
        this.controller.removeLayer(l);
    },

    addLayerWMS: function(l) {
        this.controller.layerAdded(l);
        this.map.addLayer(l.createLayerWMS());
        this.controller.setZIndex(l);

        this._openlegend(l, false);

        // check layer visibility
        this.controller.showHide(l.id, false)
    },

    addShadedLayer: function(l) {
        // adding the layer to the controller
        if ( !l.layerAdded) this.controller.layerAdded(l);
        this.createShadeLayerRequest(l, l.isadded);
    },

    createShadeLayerRequest: function(l, isReload) {
        // hiding the legend TODO: make a test if controller is currently used?
        if ( !isReload ) {
            $('#'+ l.id + '-controller-item-getlegend').css('display', 'inline-block');
            $('#'+ l.id + '-controller-item-opacity').css('display', 'block');
        }
        var _this = this;
        //var url = FMCONFIG.BASEURL_MAPS + FMCONFIG.MAP_SERVICE_SHADED;
        var url = this.options.url.MAP_SERVICE_SHADED;
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(l.layer),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function(response) {
                _this._createShadeLayer(l, response, isReload);
            }
        });
    },

    _createShadeLayer: function(l, response, isReload){
        if (typeof response == 'string')
            response = $.parseJSON(response);
        //l.layer.sldurl = response.sldurl;
        //l.layer.urlWMS = response.geoserverwms;
        l.layer.sldurl = response.url;
        // TODO: check urlWMS how to set it
        l.layer.urlWMS = this.options.url.DEFAULT_WMS_SERVER;
        if (response.geoserverwms)
            l.layer.urlWMS = response.geoserverwms

        //l.layer.urlWMS = "http://localhost:9090/geoserver/wms/";
        l.layer.legendHTML = response.legendHTML;
        l.createLayerWMSSLD();

        this._loadLayer(l, isReload)
    },

    /** TODO: mix with the other request to do one that works for both situation */
    createShadedLayerRequestCached: function(l, isReload) {
        if ( l.layer.sldurl )
            this._loadLayer(l, isReload)
        else {
            this.createShadeLayerRequest(l, isReload)
        }
    },

    _loadLayer:function(l, isReload) {
        var isReload = ( isReload == null || !isReload )? false: true;
        // TODO: if ( this.map.hasLayer(l.leafletLayer)) could be an alternative to the isReloaded check?
        if ( !isReload ) {
            this.map.addLayer(l.leafletLayer);
            this.controller.setZIndex(l);
            // this is a flag specifically for the JOIN Layers (they need to be registered as added once they are loaded )
            l.isadded = true;
        }
        else l.leafletLayer.redraw();

        // open legend
        this._openlegend(l, isReload);

        // check layer visibility
        this.controller.showHide(l.id, isReload)
    },

    reAddLayer:function(l) {
        this.map.addLayer(l.leafletLayer);
        this.controller.setZIndex(l);
        // check layer visibility
        //this.controller.showHide(l.id)
    },

    _openlegend: function(l, isReload) {
        try {
            if (l.layer.openlegend) {
                FM.LayerLegend.getLegend(l, l.id + '-controller-item-getlegend', isReload)
            }
        }catch (e) {
            console.war("_openlegend error:" + e);
        }
    },

    addPointLayer: function(l) {
        // adding the layer to the controller
        this.controller.layerAdded(l);
        this.createPointLayerRequest(l);
    },

    createPointLayerRequest: function(l) {
        // hiding the legend
        $('#'+ l.id + '-controller-item-getlegend').css('display', 'none');
        $('#'+ l.id + '-controller-item-getlegend-holder').slideUp("slow");
        $('#'+ l.id + '-controller-item-opacity').css('display', 'none');
        var _this = this;
        var url = this.options.url.MAP_SERVICE_SHADED;
        var r = new RequestHandler();
        r.open('POST', url);
        r.setContentType('application/x-www-form-urlencoded');
        r.request.onload= function () {
            // TODO: make a specific function to clear the old layer
            // cleaning the pointLayers (if they were created)
            _this._createPointLayer(l, this.responseText );
        };
        r.send(FM.Util.parseLayerRequest(l.layer));
        r.request.onerror = function () {
            // TODO: make a specific function to clear the old layer
            // cleaning the pointLayers (if they were created)
            if ( l.layer.pointsLayers ) {
                for(var i=0; i < l.layer.pointsLayers.length; i++) {
                    this.map.removeLayer(l.layer.pointsLayers[i]);
                }
            }
        };
    },

    _createPointLayer: function(l, response) {
        if (typeof response == 'string') response = $.parseJSON(response);
        l.layer.sldurl = response.sldurl;
        l.layer.urlWMS = response.geoserverwms;
        l.layer.legendHTML = response.legendHTML;
        l.layer.pointsJSON = response.pointsJSON;
        this._refreshPointLayer(l);
    },

    _refreshPointLayer:function (l) {
        // cleaning the pointLayers (if they were created)
        if ( l.layer.pointsLayers ) {
            for(var i=0; i < l.layer.pointsLayers.length; i++) {
                this.map.removeLayer(l.layer.pointsLayers[i]);
            }
        }
        if (typeof l.layer.pointsJSON == 'string') l.layer.pointsJSON = $.parseJSON(l.layer.pointsJSON);

        var _this = this;
        l.layer.pointsLayers = [];
        for(var i=0; i < l.layer.pointsJSON.length; i++) {
            var latlon = new L.LatLng(l.layer.pointsJSON[i].lat, l.layer.pointsJSON[i].lon);
            // var latlon = new L.LatLng(7.09, -67.58);
           // var properties =  { color: 'red', fillColor: '#f03', fillOpacity: 0.4, html: '<b>Venezuela (Bolivarian Republic of)</b><br>15,364,178.947 (Head)' };
            var properties =  l.layer.pointsJSON[i].properties;

            // setting the measurement unit
            l.layer.pointsJSON[i].properties.measurementunit = '';
            if ( l.layer.measurementuni != null )
                l.layer.pointsJSON[i].properties.measurementunit = l.layer.measurementunit;

            if (l.layer.pointColor != null) properties.color = l.layer.pointColor;
            if (l.layer.pointFillColor != null) properties.fillColor = l.layer.pointFillColor;
            if (l.layer.pointFillOpacity != null) properties.fillOpacity = l.layer.pointFillOpacity;

            var marker = new L.CircleMarker(latlon, properties).addTo(this.map);

            marker.setRadius(l.layer.pointsJSON[i].radius);
            marker.bindPopup(properties.title + ' - ' + properties.value );
            marker.on('mouseover', function () {
                $("#" + _this.suffix +"-popup-join-point-holder").show();
                $("#" + _this.suffix +"-popup-join-point-text").empty();
                $("#" + _this.suffix +"-popup-join-point-value").empty();
                $("#" + _this.suffix +"-popup-join-point-text").append( this.options.title );
                // TODO: N.B. l.layer.measurementunit is used **/
                $("#" + _this.suffix +"-popup-join-point-value").append(this.options.value + '  <i>' + l.layer.measurementunit + '</i>');
            });
            marker.on('mouseout', function () {
                $("#" + _this.suffix +"-popup-join-point-holder").hide();
            });
            l.layer.pointsLayers.push(marker);
        }
    },

    addGeoJSON: function(l) {
        console.log("TODO");
    },

    // syncronize the maps on movement
    syncOnMove: function (mapToSync) {
        FM.MapUtils.syncMapsOnMove(this.map, mapToSync);
    },

    // TODO: add other parameters in the request: I.E.
    getFeatureInfo: function(e, l) {
        // var fenixMap = e.target._fenixMap;
        var fenixMap = this;
//        this.addClickEffect(e.latlng, fenixMap.map);
        // get the layer that is been passed or the one that is selected in the Controller
        var l = (l) ? l: fenixMap.controller.selectedLayer;
        if ( l ) {
            if (l.layer.layertype != null && l.layer.layertype == 'JOIN') {
                FM.SpatialQuery.getFeatureInfoJoin(l, e.layerPoint, e.latlng, fenixMap);
            }
            else {
               FM.SpatialQuery.getFeatureInfoStandard(l, e.layerPoint, e.latlng, fenixMap);
            }
        }
    },

    addClickEffect: function(latlng, map) {
        var html = '<div id="reveal-cards">' +
            '<div class="cards-card">' +
            '<div style="clear:both"></div></div>';
        L.marker([
            latlng.lat,
            latlng.lng
        ], {
            icon: L.divIcon({
                // Specify a class name we can refer to in CSS.
                //className: html,
                // Define what HTML goes in each marker.
                html: html,
                // Set a markers width and height.
                iconSize: [40, 40]
            })
        }).addTo(map);
    },

    invalidateSize: function() {
      this.map.invalidateSize();
    },

    // interface GUI
    initializeMapGUI:function() {
        if ( this.options.gui != null ) {
            var _this = this;
            $.each(this.options.gui,
                function(key, value) {
                  var invoke = '_add' + key.toLowerCase();
                 try {
                     if ( FM.Plugins[invoke]) FM.Plugins[invoke](_this, value);
                 }catch (e){
                     throw new Error("Plugin: " + invoke + " doesn't exist")
                 }
            });
        }
    },


    // interface plugins
    initializePlugins:function() {
        if ( this.options.plugins != null ) {
            var _this = this;
            $.each(this.options.plugins, function(key, value) {
                 var invoke = '_add' + key.toLowerCase();

                /*FM.loadModuleLibs(key.toLowerCase(), function() {
                    FM.Plugins[invoke](_this, value)
                });*/
                FM.Plugins[invoke](_this, value)
            });
        }
    },

    /** Fenix Map  Exporting/Importing functionalities **/
    cloneMap: function(id) {
        var exportedMap = this.exportMap();
        //JSON.stringify(exportedMap.layers, null, '\t');
        var v = JSON.stringify(exportedMap.layers, function(key, val) {
            if (typeof val === 'function') {
                return val + ''; // implicitly `toString` it
            }
            return val;
        });
        var clonedMap = new FM.Map(id, exportedMap.map.options, exportedMap.map.mapOptions);
        clonedMap.createMap();
        clonedMap.createMapFromJSON(exportedMap);
        return clonedMap;
    },

    createMapFromJSON:function(json) {
        /** TODO: add baselayers handling **/
        this.loadOverlays(json.layers.overlays);
    },

    /** functionality to export the map definition **/
    exportMap:function() {
       var o = {};
       o.map   = this._getMapOptions();
       o.layers = this._getMapLayers();
       return o;
    },

    exportMapToJSONFile:function() {
        var json = this.exportMap();
        var id = FM.Util.randomID();
        var uriContent = "data:application/octet-stream;filename=mapview-"+ id +".fnx," + encodeURIComponent(JSON.stringify(json));
        var _window = window.open(uriContent, "mapview-"+ id +".fnx");
        _window.focus();
    },

    _getMapOptions:function() {
        var o = {
            options: {},
            mapOptions: {}
        };
        o.options    =  $.extend(true, {}, this.options);
        o.mapOptions =  $.extend(true, {}, this.mapOptions);
        // get current lan, lon, zoom
        this._getCurrentMapOptions(o.mapOptions)
        return o;
    },

    _getCurrentMapOptions: function(mapOptions) {
        // lat
        mapOptions.lat = this.map.getCenter().lat;
        // lng
        mapOptions.lng = this.map.getCenter().lng;
        // zoom
        mapOptions.zoom = this.map.getZoom();
    },

    _getMapLayers:function() {
        var o = {}
        o.overlays = this.controller.exportOverlays();
        return o
    },

    loadOverlays: function(overlays) {
        for(var i =0; i < overlays.length; i++) {
            // TODO: add a switch based on the layertype? i.e. what for markers
            var l = new FM.layer(overlays[i]);
            this.addLayer(l);
        }
    },

    /** TODO: codetype, code **/
    zoomTo: function(boundary, code, srs) {
        FM.LayerUtils.zoomToBoundary(this.map, boundary, code, srs);
    },

    zoomTo: function(boundary, code) {
        FM.LayerUtils.zoomToBoundary(this.map, boundary, code, 'EPSG:3827');
    },

    zoomTo: function(layer, column, codes) {
        FM.MapUtils.zoomTo(this, layer, column, codes)
    },

    zoomToCountry: function(column, codes) {
        FM.MapUtils.zoomToCountry(this, column, codes)
    },

    getSLDfromCSS: function(layername, css) {
        FM.MapUtils.getSLDfromCSS(layername, css, this.options.url.CSS_TO_SLD);
    }
});

FM.map = function (id, options, mapOptions) {
    return new FM.Map(id, options, mapOptions);
};
;
FM.LayerLegend = {

    getLegend: function(l, toRendedID, isReload) {
        // based on the layer type get the legendURL or Request
        $('#' + toRendedID + '-legend-layertitle').empty();
        $('#' + toRendedID + '-legendtitle').empty();
        $('#' + toRendedID + '-legendsubtitle').empty();
        $('#' + toRendedID + '-content').empty();

        if (l.layer.layertitle) {
            $('#' + toRendedID + '-legend-layertitle').append(l.layer.layertitle);
        }
        if (l.layer.legendtitle) {
            $('#' + toRendedID + '-legendtitle').append(l.layer.legendtitle);
        }
        if (l.layer.legendsubtitle) {
            $('#' + toRendedID + '-legendsubtitle').append(l.layer.legendsubtitle);
        }


        /* TODO: handle better, especially the l.layer.openlegend value*/
        var html = '';
        if (l.layer.legendHTML) {
            html = l.layer.legendHTML;
            $('#' + toRendedID + '-content').append(html);
        }
        else {
            var url = l.layer.urlWMS  + '?';
            url += '&service=WMS' +
                '&version=1.1.0' +
                '&REQUEST=GetLegendGraphic' +
                '&layer=' + l.layer.layers +
                '&Format=image/png';
                //'&LEGEND_OPTIONS=forceRule:True;dx:0.1;dy:0.1;mx:0.1;my:0.1;border:false;fontAntiAliasing:true;fontColor:0x47576F;fontSize:10;bgColor:0xF9F7F3';
            if (l.layer.style != null && l.layer.style != '' )
                url +=  '&style=' + l.layer.style;
            if (l.layer.sldurl )
                 url +=  '&sld=' + l.layer.sldurl;

            var alternativeUrl = url;
            url += '&LEGEND_OPTIONS=forceLabels:on;forceRule:True;dx:0;dy:0;mx:0;my:0;border:false;fontAntiAliasing:true;fontColor:0x47576F;fontSize:10;bgColor:0xF9F7F3';

            FM.LayerLegend._loadLegend(url, alternativeUrl, toRendedID)
        }

        if ( isReload ) {
            if(($('#' + toRendedID + '-holder').is(":visible"))) {
                $('#' + toRendedID + '-holder').hide();
                $('#' + toRendedID + '-holder').slideDown();
                l.layer.openlegend = true;
            }
            else {
            }
        }
        else{
            if(!($('#' + toRendedID + '-holder').is(":visible"))) {
                $('#' + toRendedID + '-holder').slideDown();
                l.layer.openlegend = true;
            } else {
                $('#' + toRendedID + '-holder').slideUp();
                l.layer.openlegend = false;
            }
        }

        //$('#' + toRendedID + '-holder').draggable();
        $('#' + toRendedID+ '-remove').click({id:toRendedID + '-holder'}, function(event) {
            $('#' + event.data.id).slideUp();
            l.layer.openlegend = false;
        });
    },

    _loadLegend: function(url, alternativeUrl, toRendedID) {
        var img = new Image();
        img.name = url;
        img.src = url;

        var html = '<img id="'+toRendedID + '-img" src="'+ img.src +'" class="decoded">';
        img.onload = function() {
            $('#' + toRendedID + '-content').append(html);
            $('#' + toRendedID + '-img').css('width', this.width);
            $('#' + toRendedID + '-img').css('height', this.height);
        }
        img.onerror  = function() {
            if ( alternativeUrl )
                FM.LayerLegend._loadLegend(alternativeUrl, null, toRendedID)
            else
                FM.LayerLegend._nolegend(toRendedID);
            // reload the image with different parameters (without legend_options)
            // if returns again error, then le legend is not available
            // '&LEGEND_OPTIONS=forceRule:True;dx:0.1;dy:0.1;mx:0.1;my:0.1;border:false;fontAntiAliasing:true;fontColor:0x47576F;fontSize:10;bgColor:0xF9F7F3'+
        }
    },

    _nolegend: function(toRendedID) {
        /** TODO: getLegendURl http://gis.stackexchange.com/questions/21912/how-to-get-wms-legendgraphics-using-geoserver-and-geowebcache **/
        var html = '<div class="fm-legend-layertitle">'+ $.i18n.prop('_nolegendavailable')+ '</div>';
        $('#' + toRendedID + '-content').append(html);
    }
    
}
;
FM.MAPController = FM.Class.extend({

    id: '',

    suffix: '',

    _map: '',

    _fenixMap: '',

    _guiController:  {
        overlay : true,
        baselayer: true
    },

    /** Used by the controller **/
    baseLayersMap:    '',    // should be an hashmap (id, layer)
    currentBaseLayer: '', // this is the layer that is currently the baselayer

    layersMap: '',  // HashMap(l.id, l)

    layersMapZIndexes: '', // HashMap(l.zindex, l.id)

    zIndexBaseLayer: 10, // TODO: modify it automatically on every update/adding of the layer checking the higher

    zIndex: 100, // TODO: modify it automatically on every update/adding of the layer checking the higher

    // used for the GFI
    selectedLayer: '',

    // GUI
    // left controller
    $boxIcons: '',
    $menuBox: '',
    $menuBoxContainer: '',
    $selectedMenuBox: '', // i.e. SelectedLayers, BaseLayers WMS Layers

    getFeautureInfoLayer: [], // TODO: this is the list of the layers selected for the GFI

    initialize: function(suffix, fenixMap, map, guiController) { // (HTMLElement or String, Object)
        this._map = map;
        this._fenixMap = fenixMap;
        this.suffix = suffix;
        this.id = suffix + '-controller';
        this._guiController = $.extend({}, this._guiController, guiController);

        // initialize HashMaps
        this.baseLayersMap = new HashMap();
        this.layersMap = new HashMap();
        this.layersMapZIndexes = new HashMap();
    },

    /**
     *
     * initialize the Layer Controller GUI
     *
     */
    initializeGUI:function() {
        if ( this._guiController ) {
            // adding the box gui
            $('#' + this.id).append(FM.replaceAll(FM.guiController.box, 'REPLACE', this.suffix));

            // adding the box icons container
            $('#' + this.id).append(FM.replaceAll(FM.guiController.boxIcons, 'REPLACE', this.suffix));
            this.$menuBox = $('#' + this.suffix + '-controller-box');
            this.$menuBoxContainer = $('#' + this.suffix + '-controller-box-content');
            this.$boxIcons = $('#' + this.suffix + '-controller-box-icons-container');

            this.$boxIcons

            /** TODO: make it nicer and more dynamic, with a more consistent name **/
            if ( this._guiController.overlay) {
                this.loadIcon('overlay');
                this.initializeOverlayDragging();
            }
            if ( this._guiController.baselayer) {
                this.loadIcon('baselayer');
            }

            if ( this._guiController.wmsLoader) {
                this.loadIcon('wmsLoader');
                var wmsUtils = new FM.WMSUtils();
                var idDD =      this.suffix + '-controller-wmsLoader-dropdown';
                var idContent = this.suffix + '-controller-wmsLoader-content';
                var wmsServers = FM.WMSSERVERS.DEFAULT_EXTERNAL_WMS_SERVERS;
                wmsUtils.WMSCapabilities(idDD, idContent, this._fenixMap, wmsServers);
            }
        }
    },

    /**
     *
     * Inizialize an Icon to load
     *
     * @param toLoad
     */
    loadIcon: function(toLoad) {
        var guiController = FM.guiController;
        var guiBox = toLoad + 'Box';
        var guiIcon = toLoad + 'Icon';

        this.$boxIcons.show();
        this.$boxIcons.append(FM.replaceAll(guiController[guiIcon], 'REPLACE', this.suffix));
        this.$menuBoxContainer.append(FM.replaceAll(guiController[guiBox], 'REPLACE', this.suffix));

        var boxIcon = $('#' + this.suffix + '-controller-' + toLoad + 'Icon');
        boxIcon.attr( "title", $.i18n.prop('_' + toLoad));
        try {boxIcon.powerTip({placement: 'ne'}); } catch (e) {}

        var _this = this;
        var $id =  $('#' + _this.suffix + '-controller-' + toLoad + '-box');
        $('#' + this.suffix + '-controller-' + toLoad + 'Icon').click({$id: $id, suffix: this.suffix}, function(event) {
                var $id = event.data.$id;
                var suffix =  event.data.suffix;
                if (_this.$menuBox.is(':visible')) {
                    // check if the select icon is the same that is shown
                    if ( _this.$selectedMenuBox == $id ) {
                        // close the panel
                        _this.$menuBox.slideUp("slow")
                        $id.hide();
                        _this.$selectedMenuBox = '';
                    }
                    else {
                        _this.$selectedMenuBox.hide();
                         $id.slideDown("slow");
                        _this.$selectedMenuBox = $id;
                    }
                }
                else {
                    // if the menu box is invisible
                    _this.$selectedMenuBox = $id;
                    _this.$selectedMenuBox.show();
                    _this.$menuBox.slideDown("slow", function() {
                    });
                }
        });

        // close icon
        $('#' + this.suffix + '-controller-' + toLoad + '-remove').click({$id: $id, suffix: this.suffix}, function(event) {
            var $id = event.data.$id;
            var suffix =  event.data.suffix;
            $('#' + suffix + '-controller-box').slideUp("slow");
            $id.hide();
        });
    },

    /**
     * Initialize the Drag and Drop of the Overlays
     */
    initializeOverlayDragging: function() {
        var _this = this;
        $('#'+ this.suffix + '-controller-overlay-content').sortable({
            cursor: 'move',
            opacity:'0.5',
            start: function (event, ui) {
                //console.log( ui.item.index());
                //$(ui.item).data("startindex", ui.item.index());
            },
            stop: function (event, ui) {
                // getting layers order
                var children = $(ui.item).parent().children();
                var layerIDs = [];
                var zIndexBase = 0;
                for(var i=children.length-1; i >= 0; i-- ) {
                    var id = $(children[i]).data("layer").id;
                    var layertitle = $(children[i]).data( "layer").layer.layertitle;
                    var zIndex =  zIndexBase + 100
                    layerIDs.push($(children[i]).data("layer").id)
                    _this.updateZIndex(id, zIndex);
                    zIndexBase++;
                }
                // setting the z-indexes based on the layers order list
                // N.B. they are set from the bottom to the top
            }
        });
    },

    /**
     *
     * Add a Layer Overlay to the Layer Controller
     *
     * @param l
     */
    layerAdded: function(l) {
        l.layerAdded = true;
        /** TODO: check if works always this solution **/
        if ( !l.layer.zindex ) {
            l.layer.zindex = this.zIndex;
            l.leafletLayer.setZIndex = l.layer.zindex;
        }
        this.zIndex = this.zIndex + 2;

        if ( l.layer.hideLayerInControllerList ) {
            // do nothing
        }
        else {
            // add legend to the mapDIV
            var legendStructure = FM.replaceAll(FM.guiController.legend, 'REPLACE', l.id);
            var idMap =  '#'+ this.suffix + '-container-map';
            $(idMap).append(legendStructure);

            // creating the HTML controller-overlay-item structure
            var idStructure =  '#'+ this.suffix + '-controller-overlay-content';
            var idItem = '#'+ l.id + '-controller-item';
            var idControllerItem = l.id + '-controller-item';
            var overlayStructure = FM.replaceAll(FM.guiController.overlay, 'REPLACE', l.id);

            // TODO: a way to get the layer back by the ID

            // $(idStructure).append(overlayStructure);
            $(idStructure).prepend(overlayStructure);

            // saving the layer information (it's too many information TODO: please set only ID and needed infos
            $( '#'+ l.id  + '-controller-item-box' ).data( "layer", l );

            var index = $('#'+ l.id  + '-controller-item-box').index() + 1;

            // setting up the layer GUI options
            this._layerGUIOptions(l);

            // setting the layer to the HashMap to handle the ID and ZIndex
            this.layersMap.set(l.id, l);
            this.layersMapZIndexes.set(l.layer.zindex, l.id)

            // drag and drop layer
            $(idItem).attr( "title", $.i18n.prop('_dragdroplayer'));
            try { $(idItem).powerTip({placement: 'e'}); } catch (e) {}

            var _this = this;
            // listeners
            $(idItem + '-title').append(l.layer.layertitle);
            $(idItem + '-title').attr( "title", l.layer.layertitle);
            try { $(idItem + '-title').powerTip({placement: 'se'}); } catch (e) {}

            // Remove Layer
            var $removeLayer = $(idItem+ '-remove');
            $removeLayer.click({l:l}, function(event){
                event.stopPropagation();
                if(confirm( $.i18n.prop('_confirmremovelayer'))) {
                    _this.removeLayer(event.data.l);
                }
                event.preventDefault();

            });
            $removeLayer.attr( "title", $.i18n.prop('_removelayer'));
            try { removeLayer.powerTip({placement: 'n'}); } catch (e) {}

            // Enable/Disable layer
            var $enabledisablelayer = $(idItem+ '-enabledisable');
            $enabledisablelayer.click({id:l.id}, function(event) {
                _this.showHide(event.data.id)
            });
            $enabledisablelayer.attr( "title", $.i18n.prop('_enabledisablelayer'));
            try { $enabledisablelayer.powerTip({placement: 'se'}); } catch (e) {}

            // Layer Opacity
            var opacity = 1;
            if ( l.layer.opacity != null )
                opacity = l.layer.opacity;
            try {
                var $layeropacity = $(idItem+ '-opacity');
                $layeropacity.slider({
                    orientation: "horizontal",
                    range: "min",
                    min: 0,
                    max: 1,
                    step: 0.1,
                    value: opacity,
                    slide: function( event, ui ) {
                        FM.LayerUtils.setLayerOpacity(l, ui.value);
                    }
                });
                $layeropacity.attr( "title", $.i18n.prop('_layeropacity'));
                try { $layeropacity.powerTip({placement: 'se'}); } catch (e) {}
            } catch(e) {
                // console.log('jquery-ui is not loaded');
            }

            // Layer GetFeatureInfo
            var $layergfi = $(idItem+ '-getfeatureinfo');
            if ( !l.layer.enablegfi ) $(idItem+ '-getfeatureinfo').css("display","none");
            else {
                $layergfi.click({id:l.id}, function(event) {
                    var l = _this.layersMap.get(event.data.id);
                    if ( _this.selectedLayer.id == event.data.id) {
                        // the layer select is equal to the new one, so deselect it
                        $('#' + _this.selectedLayer.id + '-controller-item-getfeatureinfo').removeClass('fm-icon-getfeatureinfo-selected');
                        _this.selectedLayer = '';
                        l.layer.defaultgfi = false;
                    }
                    else {
                        // unselect old layer icon
                        $('#' + _this.selectedLayer.id + '-controller-item-getfeatureinfo').removeClass('fm-icon-getfeatureinfo-selected');
                        // select new layer icon
                        $('#' + event.data.id + '-controller-item-getfeatureinfo').addClass('fm-icon-getfeatureinfo-selected');
                        _this.selectedLayer = l;
                        l.layer.defaultgfi = true;
                    }
                });
                $layergfi.attr( "title", $.i18n.prop('_getfeatureinfo'));
                try { $layergfi.powerTip({placement: 'se'});} catch (e) {}
                if ( l.layer.defaultgfi ) {
                    // TODO: set default gfi style on the layer
                    this.selectedLayer = l;
                    $('#' + this.selectedLayer.id + '-controller-item-getfeatureinfo').removeClass('fm-icon-getfeatureinfo-selected');
                    // select new layer icon
                    $('#' + l.id + '-controller-item-getfeatureinfo').addClass('fm-icon-getfeatureinfo-selected');
                }
            }



            // Show/Hide Legend
            var $getlegend = $(idItem+ '-getlegend');
            if (l.layer.showlegend == null || l.layer.showlegend != false) {
                $getlegend.click({id:l.id, idToRender: idControllerItem + '-getlegend'}, function(event) {
                    var l = _this.layersMap.get( event.data.id);
                    FM.LayerLegend.getLegend(l, event.data.idToRender)
                });
            }
            $getlegend.attr( "title", $.i18n.prop('_showhidelegend'));
            try { $getlegend.powerTip({placement: 'se'}); } catch (e) {}
            $getlegend.css("display","inline-block");

            // Switch JoinType (From shaded to Point Layer)
            if (l.layer.layertype ) {
                if (l.layer.layertype == 'JOIN' ) {
                    if (l.layer.switchjointype == null || l.layer.switchjointype ) {
                        $(idItem+ '-switchjointype').css("display","inline-block");
                        $(idItem+ '-switchjointype').click({id:l.id}, function(event) {
                            _this.switchJoinType(event.data.id);
                        });

                        if (  l.layer.jointype.toLowerCase() == 'point') {
                            $(idItem+ '-switchjointype').attr( "title", $.i18n.prop('_switchtoshaded'))
                        }
                        else if ( l.layer.jointype.toLowerCase() == 'shaded')  {
                            $(idItem+ '-switchjointype').attr( "title", $.i18n.prop('_switchtopoint'))
                        }
                        try { $(idItem+ "-switchjointype").powerTip({placement: 'se'}); } catch (e) {}
                    }
                }
            }

            // Enable/Disable Swipe
            var $swipelayer = $(idItem+ '-swipe');
            $swipelayer.click({id:l.id}, function(event) {
                var l = _this.layersMap.get( event.data.id);
                if (l.layer.swipeActive == null || !l.layer.swipeActive) {
                    FM.LayerSwipe.swipeActivate(l, _this._fenixMap.suffix + '-handle', _this._fenixMap.suffix + '-map', _this._map);
                    // select icon
                    $swipelayer.addClass('fm-icon-swipe-selected')
                }
                else {
                    FM.LayerSwipe.swipeDeactivate(l, _this._map);
                    // deselect icon
                    $swipelayer.removeClass('fm-icon-swipe-selected')
                }
            });

            // ZoomToLayer or BBOX
            var $zoomtolayer = $(idItem+ '-zoomtolayer');
            if ( l.layer.zoomToBBOX ) {
                $zoomtolayer.css("display","inline-block");
                $zoomtolayer.attr( "title", $.i18n.prop('_zoomtolayer'));
                $zoomtolayer.click({id:l.id}, function(event) {
                    var l = _this.layersMap.get( event.data.id);
                    FM.LayerUtils.zoomToLayer(_this._map, l.layer)
                });
            }
            if (l.layer.zoomTo ) {
                $zoomtolayer.css("display","inline-block");
                $zoomtolayer.attr( "title", $.i18n.prop('_zoomtolayer'));
                $zoomtolayer.click({id:l.id}, function(event) {
                    var l = _this.layersMap.get( event.data.id);
                    FM.LayerUtils.zoomToLayer(_this._map, l.layer)
                });
            }

            // Show/Hide SubIcons
            var $subiconsshowhide  = $(idItem+ '-showhide-subicons');
            var $subiconscontainer = $(idItem+ '-subicons');
            $subiconsshowhide.click(function(event) {
                $subiconscontainer.slideToggle();
                if ( $subiconsshowhide.hasClass("fm-icon-up")) {
                    $subiconsshowhide.removeClass("fm-icon-up")
                    $subiconsshowhide.addClass("fm-icon-down")
                }
                else {
                    $subiconsshowhide.removeClass("fm-icon-down")
                    $subiconsshowhide.addClass("fm-icon-up")
                }
            });
            $subiconsshowhide.attr( "title", $.i18n.prop('_layersubicons'))
            try { $subiconsshowhide.powerTip({placement: 'n'}); } catch (e) { }




        // TODO: it should not be here it should be a check on add layer listener (and check wheater is hidden or not
            /*            console.log(l.layer.enabled);
             // set the layer to disable if enable == false
             if ( !l.layer.enabled ) {
             l.layer.visibility = true;
             this.showHide(l.id);
             }*/



            // enable disable layer
            /*        $(idItem+ '-joinsettings').click({id:l.id}, function(event) {
             var l = _this.layersMap.get( event.data.id);
             l.layer.intervals = 2;
             //_this._fenixMap.createShadeLayerRequest(l, true)
             _this._fenixMap.createPointLayerRequest(l)
             });*/
            /*
             if ( l.layer.jointype ) {
             $(idItem+ '-joinsettings').show();
             $(idItem+ '-joinsettings').attr( "title", $.i18n.prop('_joinsettings'));
             $(idItem+ '-joinsettings').click({id:l.id}, function(event) {
             var l = _this.layersMap.get( event.data.id);
             //FM.LayerUtils.getValuesOuterEqualThan(l, 5, 10000);
             FM.LayerUtils.getValuesInBetweenEqualThan(l, 1500, 100000);

             switch (l.layer.jointype) {
             case 'point' :  _this._fenixMap.createPointLayerRequest(l); break;
             case 'shaded' :  _this._fenixMap.createShadeLayerRequest(l, true); break;
             }
             });
             }*/

        }
    },

    _layerGUIOptions:function(l) {
        var gui = l.gui;
        // at Gaul Level 1 remove the point layer option
        if (l.layer.layertype == 'JOIN') {
            if ( l.layer.gui !=null )
                if (l.layer.gui.nojoinlayerswitch != null && l.layer.gui.nojoinlayerswitch) {
                    // TODO: hide pointlayer option
                    // hiding the legend
                    $('#'+ l.id + '-controller-item-switchjointype').css('display', 'none');
                }
        }
    },

    /**
     *
     * Add a Base Layer to the Layer Controller
     *
     * @param l
     */
    addBaseLayer: function(l) {

        // setting the zIndex and updating it
        //console.log(this.zIndexBaseLayer);
        l.layer.zindex = this.zIndexBaseLayer;
        this.zIndexBaseLayer = this.zIndexBaseLayer + 2;

        // setting the layer to the HashMap to handle the ID and ZIndex
        this.baseLayersMap.set(l.id, l);
        this.layersMapZIndexes.set(l.layer.zindex, l.id);

        // creating the HTML controller-overlay-item structure
        var idStructure =  '#'+ this.suffix + '-controller-baselayer-content';
        var idItem = '#'+ l.id + '-controller-item';
        var overlayStructure = FM.replaceAll(FM.guiController.baselayer, 'REPLACE', l.id);
        overlayStructure = FM.replaceAll(overlayStructure, 'MAPID', this._fenixMap.id);

        $(idStructure).append(overlayStructure);

        var _this = this;
        // listeners
        $(idItem + '-title').append(l.layer.layertitle);

        // add baselayer icon
        $('#' + l.id + '-controller-item-baselayer-image').addClass("fm-icon-baselayer-" + l.layer.layername);

        $(idItem+ '-enabledisable').click({id:l.id}, function(event) {
            _this.showHide(event.data.id)
        });

        var opacity = 1;
        if ( l.layer.opacity != null )
            opacity = l.layer.opacity;
        try {
            $(idItem+ '-opacity').slider({
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 1,
                step: 0.1,
                value: opacity,
                slide: function( event, ui ) {
                    FM.LayerUtils.setLayerOpacity(l, ui.value);
                }
            });
        }catch(e) {
            //console.log('jquery-ui is not loaded');
        }

        $('#' + l.id + '-controller-box-item').click({id:l.id}, function(event) {
            var id = event.data.id;
            var l = _this.baseLayersMap.get(id);

            // removing the old baselayer
            _this.removeBaseLayerByID(_this.currentBaseLayer.id);
            var oldBaseLayer = _this.baseLayersMap.get(_this.currentBaseLayer.id);
            $('#' + oldBaseLayer.id + "-controller-box-item").removeClass('fm-controller-box-item-baselayer-content-selected')
            $('#' + oldBaseLayer.id + "-controller-item-opacity").hide();

            // add the new baselayer to the map and setting as default one
            $('#' + l.id + "-controller-box-item").addClass('fm-controller-box-item-baselayer-content-selected')
            $('#' + l.id + "-controller-item-opacity").show();
            _this._map.addLayer(l.leafletLayer);
            _this.currentBaseLayer = l;
            _this.setZIndex(l)

        });

        // select baselayer item
        if ( this.baseLayersMap.count() == 1 ){
            $(idItem + '-radio').attr('checked', true);
            // add the layer just if it's the first one
            this._map.addLayer(l.leafletLayer);
            this.currentBaseLayer = l;
            $('#' + l.id + "-controller-box-item").addClass('fm-controller-box-item-baselayer-content-selected')
            $('#' + l.id + "-controller-item-opacity").show();
            _this.setZIndex(l)
        }

    },

    /*
     * Remove a layer from the Map and from the HashMap
     *
     * @param l
     */
    removeLayer:function(l) {
        if ( l.layer.jointype !=null && l.layer.jointype == 'point')
            this.removeLayerPoint(l);
        else
            this.removeLayerDefault(l);
    },


    removeLayerDefault:function(l) {
        // remove layer from the map
        this._map.removeLayer(l.leafletLayer);
        // remove layer from the hashmaps
        this.layersMap.remove(l.id);
        this.layersMapZIndexes.remove(l.layer.zindex);
        $('#' + l.id + '-controller-item-box').remove();
        $('#' + l.id + '-controller-item-getlegend-holder').remove();
    },

    /*
     * Remove the layer Point from the Map and from the HashMap
     *
     * @param id
     */
    removeLayerPoint: function(l) {
        for(var i=0; i < l.layer.pointsLayers.length; i++)
            this._map.removeLayer(l.layer.pointsLayers[i]);

        this.layersMap.remove(l.id);
        this.layersMapZIndexes.remove(l.layer.zindex);
        $('#' + id + '-controller-item-box').remove();
    },

    /*
     * Remove the layer from the Map and from the HashMap
     *
     * @param id
     */
    removeBaseLayerByID: function(id) {
        var l = this.baseLayersMap.get(id);
        // remove layer from the map
        this._map.removeLayer(l.leafletLayer);
    },

    /*
     * Switch a jointype (from Point to Shaded and from Shaded to Point)
     *
     * @param id
     */
    switchJoinType: function(id) {
        var l = this.layersMap.get(id);
        try { $.powerTip.destroy($("#" + l.id +  "-controller-item-switchjointype")); } catch (e) {}
        if (  l.layer.jointype.toLowerCase() == 'point') {
            // alert('point')
            $('#' + l.id + '-controller-item-switchjointype').attr( "title", $.i18n.prop('_switchtopoint'));
            this.switchToShaded(id);
        }
        else if ( l.layer.jointype.toLowerCase() == 'shaded') {
            // alert('shaded')
            $('#' + l.id + '-controller-item-switchjointype').attr( "title", $.i18n.prop('_switchtoshaded'));
            this.switchToPoint(id);
        }
        try { $("#" + l.id +  "-controller-item-switchjointype").powerTip({placement: 'se'}); } catch (e) {}
    },

    /*
     * Switch a Shaded joined layer to a Point one
     *
     * TODO: da vedere
     *
     * @param id
     */
    switchToPointswitchToPoint: function(id) {
        var l = this.layersMap.get(id);
        l.layer.jointype = 'point';

        if ( l.leafletLayer != null )
            this._map.removeLayer(l.leafletLayer);

        this._fenixMap.createPointLayerRequest(l);
    },

    /*
     * Switch a Point joined layer to a Shaded one
     *
     * TODO: da vedere
     *
     * @param id
     */
    switchToShaded: function(id) {
        var l = this.layersMap.get(id);
        l.layer.jointype = 'shaded';

        // cleaning the pointLayers
        if ( l.layer.pointsLayers != null ) {
            for(var i=0; i < l.layer.pointsLayers.length; i++) {
                this._map.removeLayer(l.layer.pointsLayers[i]);
            }
        }
        this._fenixMap.createShadeLayerRequest(l);
    },

    /**
     *  Show/Hide the layer from the map
     *
     * @param id
     */
    showHide: function(id, isReload) {
        try {
            var l = this.layersMap.get(id);
            if (l) {
                if (l.layer.jointype && l.layer.jointype.toLowerCase() == 'point')
                    this.showHidePointLayer(id);
                else
                    this.showHideLayer(id, isReload);
            }
        }catch (e) {
            console.warn("showHide warn:" + e);
        }
    },

    /***
     *
     * Show/Hide a Point Layer
     *
     * @param id
     */
    showHidePointLayer: function(id) {
        var l = this.layersMap.get(id);
        for(var i=0; i < l.layer.pointsLayers.length; i++) {
            if (l.layer.visibility == null || l.layer.visibility) {
                l.layer.visibility = false;
                $('#'+ id+ '-controller-item-enabledisable').removeClass('fm-icon-enable');
                $('#'+ id+ '-controller-item-enabledisable').addClass('fm-icon-disable');
                for(var i=0; i < l.layer.pointsLayers.length; i++)
                    this._map.removeLayer(l.layer.pointsLayers[i]);
            }
            else {
                l.layer.visibility = true;
                $('#'+ id+ '-controller-item-enabledisable').removeClass('fm-icon-disable');
                $('#'+ id+ '-controller-item-enabledisable').addClass('fm-icon-enable');
                for(var i=0; i < l.layer.pointsLayers.length; i++)
                    this._map.addLayer(l.layer.pointsLayers[i]);
            }
        }
    },

    /**
     * Show/Hide the layer  removing it and readding ti to leaflet for performance issues
     *
     * @param id
     */
    showHideLayer:function(id, isReload) {
        try {
            var l = this.layersMap.get(id);
            if (isReload != null && !isReload) {
                if (l.layer.visibility == false) {
                    $('#' + id + '-controller-item-enabledisable').removeClass('fm-icon-enable');
                    $('#' + id + '-controller-item-enabledisable').addClass('fm-icon-disable');
                    this._map.removeLayer(l.leafletLayer)
                }
            }
            else if (isReload != null && isReload) {
                // do nothing (this will maintain the old status
            }
            else {
                if (l.layer.visibility == null || l.layer.visibility) {
                    l.layer.visibility = false;
                    ;
                    $('#' + id + '-controller-item-enabledisable').removeClass('fm-icon-enable');
                    $('#' + id + '-controller-item-enabledisable').addClass('fm-icon-disable');
                    //document.getElementById(id).style.display = 'none';
                    this._map.removeLayer(l.leafletLayer)
                }
                else {
                    l.layer.visibility = true;
                    $('#' + id + '-controller-item-enabledisable').removeClass('fm-icon-disable');
                    $('#' + id + '-controller-item-enabledisable').addClass('fm-icon-enable');
                    //document.getElementById(id).style.display = 'block';
                    this._map.addLayer(l.leafletLayer);
                    this.setZIndex(l) // this method assigns the Z-Index and the ID to the layer
                }
            }
        }catch (e) {
            console.warn("showHideLayer error:"  + e);
        }
    },

    /**
     * Update the Z-Index of a layer retrieving it by ID
     *
     * @param layerID
     * @param updatedZIndex
     */
    updateZIndex: function(layerID, updatedZIndex) {
        var l = this.layersMap.get(layerID);
        l.layer.zindex = updatedZIndex;
        l.leafletLayer.setZindex = updatedZIndex;
        try {
            document.getElementById(l.id).style.zIndex=updatedZIndex;
        }catch (e) {
           // console.log('error updateZIndex: ' + l.id + ' doesnt exists');
        }

    },

    /**
     * This method search for the new layer added (a new layer or a layer that was hidden
     * and set the index and the id of the layer that is missing the ID/Z-Index
     *
     * @param l
     */
    setZIndex: function (l) {
        try {
            var layers = document.getElementById(this._fenixMap.tilePaneID).childNodes;
            for (i = 0, len = layers.length; i < len; i++) {
                if (layers[i] !== this._container) {
                    var zIndex = parseInt(layers[i].style.zIndex, 10);
                    if ( isNaN(zIndex))  {
                        layers[i].style.zIndex = l.layer.zindex;
                        layers[i].id = l.id;
                    }
                }
            }
        } catch (e) {
            console.warn("setZIndex error:"  + e);
        }
    },

    selectGetFeatureInfoIcon:function (id) {
        for(var i=0; i < this.layersMap.count(); i++) {
            if ( this.layersMap._data[i] == id )
                $('#' + id + '-controller-item-getfeatureinfo').addClass('fm-icon-getfeatureinfo-selected');
            else
                $('#' + id + '-controller-item-getfeatureinfo').removeClass('fm-icon-getfeatureinfo-selected');
        }

    },

    exportOverlays:function() {
        //console.log('exportOverlays');

        /* TODO: make it simpler **/
        var arrayZindex = [];
        this.layersMap.forEach(function(l) {
            arrayZindex.push(l.layer.zindex)
        });
        arrayZindex = arrayZindex.sort()

        //console.log(arrayZindex);

        /** get the id based on the zIndex **/
        var arrayLayers = [];
        for (var i = 0; i < arrayZindex.length; i++ ) {
            var found = false;
            if ( !found)
                this.layersMap.forEach(function(l) {
                    //console.log(e);
                    if (l.layer.zindex == arrayZindex[i]) {
                        arrayLayers.push(l.layer);
                        found = true;
                    }
                });
        }
        var clonedArray = $.map(arrayLayers, function (obj) {
            return $.extend(true, {}, obj);
        });
        return clonedArray;
    },

    exportBaselayers:function() {
        /* TODO: make it easier the load of the baselayers
        *  add a value to set the current selected one (also on startup)
        * **/

        return null;
    },

    /**
     *
     * TODO: update the zindex counter to the latest zindex currently used each time is added a layer
     */
    updateZindexCounter: function() {

    }


});

FM.mapController = function (suffix, fenixMap, map, guiController) {
    return new FM.MAPController(suffix, fenixMap, map, guiController);
};;
FM.guiController = {

    boxIcons: '<div id="REPLACE-controller-box-icons-container" class="fm-icon-box-background fm-controller-box-icons-container"></div>',

    box:
        '' +
            '<div class="fm-box-zindex fm-icon-box-background fm-controller-box-icons-container fm-controller-box" style="display:none" id="REPLACE-controller-box">' +
                '<div id="REPLACE-controller-box-content"></div>' +
            '</div>' +
        '',

    baselayerIcon: "<div class='fm-box-zindex'><div class='fm-icon-sprite fm-baselayers' id='REPLACE-controller-baselayerIcon'><div></div>",
    baselayerBox: '<div class="fm-box-zindex" id="REPLACE-controller-baselayer-box" style="display:none">' +
                        '<div id="REPLACE-controller-baselayer-title" class="fm-controller-box-title">Baselayers</div>' +
                        '<div id="REPLACE-controller-baselayer-remove" class="fm-icon-close-panel-sprite fm-icon-close fm-icon-right"></div>' +
                        '<div class="fm-standard-hr"></div>' +
                        '<div id="REPLACE-controller-baselayer-content" class="fm-controller-box-content"></div>' +
                    '</div>',
    baselayer :
        '<div id="REPLACE-controller-box-item" class="fm-box-zindex fm-controller-box-item-baselayer-content">' + // class="fm-controller-box-item">' +
            '<div id="REPLACE-controller-item">' +
                '<div class="fm-controller-box-item-baselayer-image" id="REPLACE-controller-item-baselayer-image"></div>' +
                '<div class="fm-controller-box-item-baselayer-text">' +
                    '<div>' +
                        '<label class="fm-controller-box-item-baselayer-text fm-controller-item-title" id="REPLACE-controller-item-title"><input id="REPLACE-controller-item-radio"  class="fm-checkbox-hide" type="radio" name="MAPID" value="REPLACE"><label>' +
                    '</div>' +
                    '<div style="clear:both"></div>' +
                    '<div class="fm-opacity-slider-baselayers" id="REPLACE-controller-item-opacity" style="display:none"></div>' +
                '</div>' +
            '</div>' +
        '</div>',

    overlayIcon:  "<div class='fm-box-zindex'><div class='fm-icon-sprite fm-overlays' id='REPLACE-controller-overlayIcon'></div></div>",
    overlayBox:   '<div class="fm-box-zindex" id="REPLACE-controller-overlay-box" style="display:none;">' +
                    '<div id="REPLACE-controller-overlay-title" class="fm-controller-box-title">Selected Layers</div>' +
                    '<div id="REPLACE-controller-overlay-remove" class="fm-icon-close-panel-sprite fm-icon-close fm-icon-right"></div>' +
                    '<div class="fm-standard-hr"></div>' +
                    '<div id="REPLACE-controller-overlay-content" class="fm-controller-box-content"></div>' +
                  '</div>',
    overlay :'<div id="REPLACE-controller-item-box" class="fm-box-zindex fm-controller-box-item">' +
                    '<div id="REPLACE-controller-item" class="fm-controller-box-header">' +
                        '<div class="fm-controller-box-header-text">' +
                            '<div class="fm-controller-item-title" id="REPLACE-controller-item-title" ></div>' +
                            '<div class="fm-icon-right fm-icon-layer-panel-sprite fm-icon-down" id="REPLACE-controller-item-showhide-subicons"></div>' +
                            '<div class="fm-icon-right fm-icon-layer-panel-sprite fm-icon-panel-remove" id="REPLACE-controller-item-remove"></div>' +
                            '<div class="fm-icon-right fm-icon-layer-panel-sprite fm-icon-panel-info" id="REPLACE-controller-item-icon" ></div>' +
                        '</div>' +
                        '<div style="clear:both"></div>' +
                        '<div class="fm-controller-box-icons">' +
                             '<div class="fm-icon-enable" id="REPLACE-controller-item-enabledisable"></div>' +
                            '<div  class="fm-opacity-slider" style="margin-right:10px;" id="REPLACE-controller-item-opacity"></div>' +
                         '</div>' +
                        '<div style="clear:both"></div>' +
                        '<div class="fm-controller-box-subicons" id="REPLACE-controller-item-subicons" style="display:none;">' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-getlegend" id="REPLACE-controller-item-getlegend"></div>' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-getfeatureinfo" id="REPLACE-controller-item-getfeatureinfo"></div>' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-switchJoinType" id="REPLACE-controller-item-switchjointype" style="display:none"></div>' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-zoomto" id="REPLACE-controller-item-zoomtolayer" style="display:none"></div>' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-swipe" id="REPLACE-controller-item-swipe"></div>' +
                            '<div class="fm-icon-layer-subicons-sprite fm-icon-switchJoinType" id="REPLACE-controller-item-joinsettings" style="display:none"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>',
    wmsLoaderIcon: "<div class='fm-box-zindex'><div class='fm-icon-sprite fm-wmsloader' id='REPLACE-controller-wmsLoaderIcon'></div></div>",
    wmsLoaderBox: '<div class="fm-box-zindex" id="REPLACE-controller-wmsLoader-box" style="display:none; min-height:300px;">' +
                    '<div id="REPLACE-controller-wmsLoader-title" class="fm-controller-box-title">WMS Loader</div>' +
                    '<div id="REPLACE-controller-wmsLoader-remove" class="fm-icon-close-panel-sprite fm-icon-close fm-icon-right"></div>' +
                    '<div class="fm-standard-hr"></div>' +
                    '<div class="clear:both"></div>' +
                    '<div class="fm-WMSLoaderDropDown" id="REPLACE-controller-wmsLoader-dropdown"></div>' +
                    '<div id="REPLACE-controller-wmsLoader-content" class="fm-controller-wmsLoader-content"></div>' +
                 '</div>',
    wmsLoaderLayer: '<div id="REPLACE-WMSLayer-box" class="fm-WMSLayer-box">' +
                        '<div id="REPLACE-WMSLayer-icon" class="fm-controller-box-icon fm-icon-info"></div>' +
                        '<div id="REPLACE-WMSLayer-title" class="fm-WMSLayer-title"></div>' +
                    '</div>',


    legend: '<div class="fm-icon-box-background fm-box-legend" id="REPLACE-controller-item-getlegend-holder">' +
            //'<div class="fm-box-zindex fm-icon-box-background fm-box-legend" id="REPLACE-controller-item-getlegend-holder">' +
//            '<div class="fm-box-zindex fm-box fm-box-legend" id="REPLACE-controller-item-getlegend-holder">' +
            '<div class="fm-legend-title-content">' +
                '<div id="REPLACE-controller-item-getlegend-legend-layertitle" class="fm-legend-layertitle"></div>' +
                '<div id="REPLACE-controller-item-getlegend-remove" class="fm-icon-close-panel-sprite fm-icon-close fm-icon-right"></div>' +
            '</div>' +
            '<div class="fm-standard-hr"></div>' +

            '<div id="REPLACE-controller-item-getlegend-legendtitle" class="fm-legendtitle"></div>' +
            '<div id="REPLACE-controller-item-getlegend-legendsubtitle" class="fm-legendsubtitle"></div>' +
                '<div id="REPLACE-controller-item-getlegend-content" ></div>' +
            '</div>',

    popUpJoinPoint: '<div class="fm-box fm-popup-join-point-holder" id="REPLACE-popup-join-point-holder" style="display:none">' +
                        '<div class="fm-popup-join-point-text" id="REPLACE-popup-join-point-text"></div>'+
                        '<div class="fm-popup-join-point-value" id="REPLACE-popup-join-point-value"></div>'+
                    '</div>'
};;
FM.guiMap = {

    disclaimerfao:   '<div class="fm-icon-box-background fm-disclaimerfao fm-btn-icon"><div class="fm-icon-sprite fm-icon-info" id="REPLACE-disclaimerfao"></div></div>',
    disclaimerfao_E: '<div class="fm-disclaimerfao-text">' +
        'The designations employed and the presentation of material in the maps  <br>' +
        'do not imply the expression of any opinion whatsoever on the part of <br>' +
        'FAO concerning the legal or constitutional status of any country,<br>' +
        'territory or sea area, or concerning the delimitation of frontiers.<br>' +
        'South Sudan declared its independence on July 9, 2011. <br>' +
        'Due to data availability, the assessment presented in the map for Sudan<br>' +
        'and South Sudan reflects thesituation up to 2011 for the former Sudan.' +
        '</div> ',
    disclaimerfao_E:
            'The designations employed and the presentation of material in the maps  <br>' +
            'do not imply the expression of any opinion whatsoever on the part of  <br>' +
            'FAO concerning the legal or constitutional status of any country, <br>' +
            'territory or sea area, or concerning the delimitation of frontiers.  <br>' +
            'South Sudan declared its independence on July 9, 2011. <br>' +
            'Due to data availability, the assessment presented in the map for Sudan  <br>' +
            'and South Sudan reflects thesituation up to 2011 for the former Sudan.',
    disclaimerfao_S: '',
    disclaimerfao_S_styled: '<div class="fm-disclaimerfao-text"></div> ',
    disclaimerfao_F: '',
    disclaimerfao_F_styled: '<div class="fm-disclaimerfao-text">' +
        '</div> '
};
;
FM.WCS = function() {

    // TODO: config are the map.config (to be passed)
    var config = {
        url: {}
    }

    // PROXY used to load the requests
    var PROXY = (config.url.MAP_SERVICE_PROXY)? config.url.MAP_SERVICE_PROXY: 'http://fenixapps2.fao.org/maps/rest/service/request'

    // current version
    var VERSION = '1.1.1';

    // this variable is used to manage the WFS Version in 2.0 typeName became typeNames
    var IDENTIFIERS = {
        '1.1.1' : 'identifiers',
        '2.0'   : 'identifiers'
    }

    /**
     * Return the description of the columns
     * @param obj
     * @param callback call back function
     * var obj = {url: '', layername: '', version: '' // in case it's not 1.1.0'}
     */
    var getDescription = function(obj, callback) {
        var request = PROXY;
        request += '?service=wcs';
        request += ( obj.version )? '&version=' + obj.version: '&version=' + VERSION;
        request += '&request=DescribeCoverage';
        request += '&' + IDENTIFIERS[VERSION] +'=' + obj.layername;
        request += '&urlWMS=' + obj.url; //TODO: on the service change name to refrect just a url and not urlWMS
        $.ajax({
            type: 'GET',
            url: request,
            success: function(response) { parseXML(response, callback) },
            error: function() { console.log('WCS error getDescription() REQUEST'); }
        });
    }

    var parseXML = function(xml, callback) {
        var result = 'TODO: parse XML if there are useful information'
        if ( callback) callback(result)
    }

    return {
        getDescription: getDescription,
        getVersion: function() { return VERSION }
    }
}();

;
FM.WFS = function(config) {

    // TODO: config are the map.config (to be passed)
    var config = {
        url: {}
    }

    // PROXY used to load the requests
    var PROXY = (config.url.BASEURL_MAPS)? config.url.MAP_SERVICE_PROXY: 'http://fenixapps2.fao.org/maps/rest/service/request'

    // current WFS version
    var VERSION = '1.1.0';

    // this variable is used to manage the WFS Version in 2.0 typeName became typeNames
    var TYPENAME = {
        '1.1.0' : 'typeName',
        '2.0'   : 'typeNames'
    }

    /**
     * Return the description of the columns
     * @param obj
     * @param callback call back function
     * var obj = {url: '', layername: '', version: '' // in case it's not 1.1.0'}
     */
    var getFields = function(obj, callback) {
        var request = PROXY;
        request += '?SERVICE=WFS';
        request += (obj.version)? '&VERSION=' + obj.version: '&VERSION=' + VERSION;
        request += '&request=DescribeFeatureType';
        request += '&' + TYPENAME[VERSION] +'=' + obj.layername;
        request += '&urlWMS=' + obj.url; //TODO: on the service change name to refrect just a url and not urlWMS
        $.ajax({
            type: 'GET',
            url: request,
            success: function(response) { parseXML(response, callback) },
            error: function() { console.log('WFS error getDescription() REQUEST'); }
        });
    }

    var parseXML = function(xml, callback) {
        var xmlResponse = $.parseXML(xml), $xml = $( xmlResponse );
        var result = []
        $xml.find('xsd\\:sequence xsd\\:element').each(function() {
            // creating the json with the names and type of the fields
            result.push({ name: $(this).attr('name'), type: $(this).attr('type')} )
        });
        if ( callback)
            callback(result)
    }

    /**
     * Return the description of the columns
     * @param obj
     * @param callback call back function
     * var obj = {url: '', layername: '', propertyname: '' //attribute1,attribute2, sortby: '' // attribute+D attribute+A, version: '' // in case it's not 1.1.0' }
     */
    //http://hqlprfenixapp1.hq.un.fao.org:10090/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeName=fenix:gaul1_3857_2&propertyName=adm0_code,faost_n&sortBy=faost_n
    var getFieldsValues = function(obj, callback) {
        var request = PROXY;
        request += '?SERVICE=WFS';
        request += (obj.version)? '&VERSION=' + obj.version: '&VERSION=' + VERSION;
        request += '&request=GetFeature';
        request += '&' + TYPENAME[VERSION] +'=' + obj.layername;
        request += (obj.propertyname)? '&propertyname=' + obj.propertyname: '';
        request += (obj.sortby)? '&sortby=' + obj.sortby: '';
        request += '&outputFormat=json';
        request += '&urlWMS=' + obj.url; //TODO: on the service change name to refrect just a url and not urlWMS
        $.ajax({
            type: 'GET',
            url: request,
            success: function(response) { if(callback) callback(response) },
            error: function() { console.log('WFS error getDescription() REQUEST');  }
        });
    }

    var getFieldValueMin = function(obj, callback) {}
    var getFieldValueMax = function(obj, callback) {}

    return {
        getFields: getFields,
        getFieldsValues: getFieldsValues,
        getVersion: function() { return VERSION }
    }
}();

;
FM.LayerSwipe = {

    swipeActivate: function(l, handleID, containerID, map) {
        l.layer.swipeActive = true;
        var l_parent = l.leafletLayer._container,
           // handle = document.getElementById(fenixMap.suffix +  '-handle'),
            handle = document.getElementById(handleID),
            dragging = false;
/*        console.log('L_parent');
        console.log(l_parent);*/
        handle.onmousedown = function() { dragging = true; return false;}
        document.onmouseup = function() { dragging = false; }
        document.onmousemove = function(e) {
            if (!dragging) return;
            setDivide(e.x);
        }

        var _this = this;

        l.redraw = function( e ) {
            l_parent = l.leafletLayer._container;
            setDivide(parseInt(handle.style.left));
        };

        l.mousemoveSwipe = function( e ) {
            l_parent = l.leafletLayer._container;
            setDivide(e.containerPoint.x);
        };

        map.on( "zoomend", l.redraw);
        map.on( "moveend", l.redraw);
        map.on( "drag", l.redraw);
        map.on( "mousemove", l.mousemoveSwipe );

        function setDivide(x) {
            x = Math.max(0, Math.min(x, map.getSize()['x']));
            handle.style.left = (x) + 'px';
            var layerX = map.containerPointToLayerPoint(x,0).x
            l_parent.style.clip = 'rect(-99999px ' + layerX + 'px 999999px -99999px)';
        }

        // set 50% of the width, maybe start with 0?
       // var mydiv =  $('#' + fenixMap.suffix + '-map').width();
        var mydiv =  $('#' + containerID).width();
       // console.log(mydiv);
        setDivide(mydiv / 2);
    },

    swipeDeactivate: function(l, map) {
        map.off( "zoomend", l.redraw);
        map.off( "moveend", l.redraw);
        map.off( "drag", l.redraw);
        map.off( "mousemove", l.mousemoveSwipe );
        l.layer.swipeActive = false;

        var l_parent = l.leafletLayer._container;
        l_parent.style.clip = 'auto';
    }

}
;
FM.LayerUtils = {

    zoomToLayer: function(map, layer) {
       if ( layer.bbox)  FM.LayerUtils.zoomTOBBOX(map, layer.bbox)
       else if ( layer.zoomTo ) FM.LayerUtils.zoomToBoundary(map, layer.zoomTo.boundary, layer.zoomTo.code, layer.zoomTo.srs)
    },

    zoomToBoundary: function(map, boundary, code, srs) {
        FM.LayerUtils._zoomToRequest(map, boundary, code, srs);
    },


    zoomTOBBOX: function(map, bbox) {
        var bounds;
        if ( bbox.ymin ) {
            var southWest = new L.LatLng(bbox.ymin,bbox.xmin);
            var northEast = new L.LatLng(bbox.ymax, bbox.xmax);
            bounds = new L.LatLngBounds(southWest, northEast);
        }
        else if ( bbox ) {
            if ( bbox.length > 0) {
                var southWest = new L.LatLng(bbox[0],bbox[1]);
                var northEast = new L.LatLng(bbox[2], bbox[3]);
                bounds = new L.LatLngBounds(southWest, northEast);
            }
        }
        if ( bounds) FM.LayerUtils.zoomToBounds(map, bounds)
    },

    zoomToBounds: function(map, bounds) {
        map.fitBounds(bounds);
    },

    _zoomToRequest: function(map, boundary, code, srs) {
        var _this = this;
        var url = map.options.url.MAP_SERVICE_ZOOM_TO_BOUNDARY + '/'+ boundary +'/'+ code+'/'+ srs+'';
        $.ajax({
            type: "GET",
            url: url,
            data: FM.Util.parseLayerRequest(l.layer),
            success: function(response) {
                if (typeof response == 'string')
                    response = $.parseJSON(response);

                var southWest = new L.LatLng(response.ymin,response.xmin);
                var northEast = new L.LatLng(response.ymax, response.xmax);
                var bounds = new L.LatLngBounds(southWest, northEast);
                map.fitBounds(bounds);
            }
        });
    },

    setLayerOpacity: function(l, opacity) {
        if (l.leafletLayer) l.leafletLayer.setOpacity(opacity)
        l.layer.opacity = opacity;
        l.leafletLayer.options.opacity = opacity;
        //console.log( l.leafletLayer)
    },

    filterLayerMinEqualThan:function(fenixMap, l, value) {
         l = FM.LayerUtils.getValuesMinEqualThan(l, value);
        FM.LayerUtils._refreshLayer(fenixMap, l);
    },

    filterLayerGreaterEqualThan:function(fenixMap, l, value) {
        l = FM.LayerUtils.getValuesGreaterEqualThan(l, value);
        FM.LayerUtils._refreshLayer(fenixMap, l);
    },

    filterLayerInBetweenEqualThan:function(fenixMap, l, min, max) {
        l = FM.LayerUtils.getValuesInBetweenEqualThan(l, min, max);
        FM.LayerUtils._refreshLayer(fenixMap, l);
    },

    filterLayerOuterEqualThan:function(fenixMap, l, min, max) {
        l = FM.LayerUtils.getValuesOuterEqualThan(l, min, max);
        FM.LayerUtils._refreshLayer(fenixMap, l);
    },

    _refreshLayer: function(fenixMap, l) {
        switch (l.layer.jointype) {
            case 'point' :  fenixMap.createPointLayerRequest(l); break;
            case 'shaded' : fenixMap.createShadeLayerRequest(l, true); break;
        }
    },

    getValuesMinEqualThan:function(l, value) {
        if (typeof l.layer.defaultdata == 'string')
            l.layer.defaultdata = $.parseJSON(l.layer.defaultdata);
        l.layer.joindata = [];
        for(i=0; i < l.layer.defaultdata.length; i++) {
            $.each(l.layer.defaultdata[i], function(k, v) {
                if ( v <= value)  {
                    // TODO: optimize it
                    l.layer.joindata.push(l.layer.defaultdata[i]);
                }
            });
        }
        l.layer.joindata = JSON.stringify(l.layer.joindata);
        return l;
    },
    getValuesGreaterEqualThan:function(l, value) {
        if (typeof l.layer.defaultdata == 'string')
            l.layer.defaultdata = $.parseJSON(l.layer.defaultdata);
        l.layer.joindata = [];
        for(i=0; i < l.layer.defaultdata.length; i++) {
            $.each(l.layer.defaultdata[i], function(k, v) {
                if ( v >= value)  {
                    // TODO: optimize it
                    l.layer.joindata.push(l.layer.defaultdata[i]);
                }
            });
        }
        l.layer.joindata = JSON.stringify(l.layer.joindata);
        return l;
    },

    getValuesInBetweenEqualThan:function(l, min, max) {
        if (typeof l.layer.defaultdata == 'string')
            l.layer.defaultdata = $.parseJSON(l.layer.defaultdata);
        l.layer.joindata = [];
        for(i=0; i < l.layer.defaultdata.length; i++) {
            $.each(l.layer.defaultdata[i], function(k, v) {
                if ( v >= min && v <= max)  {
                    // TODO: optimize it
                    l.layer.joindata.push(l.layer.defaultdata[i]);
                }
            });
        }
        l.layer.joindata = JSON.stringify(l.layer.joindata);
        return l;
    },

    getValuesOuterEqualThan:function(l, min, max) {
        if (typeof l.layer.defaultdata == 'string')
            l.layer.defaultdata = $.parseJSON(l.layer.defaultdata);
        l.layer.joindata = [];
        for(i=0; i < l.layer.defaultdata.length; i++) {
            $.each(l.layer.defaultdata[i], function(k, v) {
                if ( (min &&  v <= min) || (max &&  v >= max)) {
                    // TODO: optimize it
                    l.layer.joindata.push(l.layer.defaultdata[i]);
                }
            });
        }
        l.layer.joindata = JSON.stringify(l.layer.joindata);
        return l;
    }





}
;
FM.MapUtils = function() {

    var syncMapsOnMove = function (map, mapToSync) {
        // this let you pass the FenixMap or the LeafletMap
        var m = ( map.map ? map.map: map);
        var mToSync = ( mapToSync.map ? mapToSync.map: mapToSync);
        m.on('dragend zoomend', function(e) {
            if ( m.getCenter() != mToSync.getCenter && m.getZoom() != mToSync.getZoom) {
                mToSync.setView(m.getCenter(), m.getZoom());
            }
        });
    };

    var exportLayers = function(fenixmap) {
        //console.log(fenixmap);
    };

    var zoomTo = function(m, layer, column, codes) {
        var url = m.options.url.ZOOM_TO_BBOX + layer +'/'+ column+'/'+ codes.toString();
        $.ajax({
            type: "GET",
            url: url,
            success: function(response) {
                if (m.hasOwnProperty("map"))
                    m.map.fitBounds(response);
                else
                    m.fitBounds(response);
            }
        });
    };

    var zoomToCountry = function(m, column, codes) {
        zoomTo(m, "country", column, codes);
    };

    var getSLDfromCSS = function(layername, css, url) {
        var sld = '';
        //TODO: change URL
        $.ajax({
            url: url,
            data: {
                stylename: layername,
                style: css
            },
            async: false,
            type: 'POST',
            success: function(response) {
                sld = response;
            }
        });
        return sld;
    };

    var fitWorldByScreen = function(m, bounds) {
    	//http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds

		var worldBounds = L.latLngBounds([[-90, -180], [90, 180]]),
			targetBounds = bounds instanceof L.LatLngBounds ? bounds : worldBounds,

			GLOBE_WIDTH = 190, // a constant in Google's map projection
			GLOBE_HEIGHT = 190, // a constant in Google's map projection

			west = targetBounds.getSouthWest().lng,
			east = targetBounds.getNorthEast().lng,
			angleW = east - west,

			north = targetBounds.getNorthEast().lat,
			south = targetBounds.getSouthWest().lat,
			angleH = north - south,

			mapW = m.getSize().x,
			mapH = m.getSize().y;

		if (angleW < 0)
			angleW += 360;
		if (angleH < 0)
			angleH += 360;			

		var zoomW = Math.round(Math.log(mapW * 360 / angleW / GLOBE_WIDTH) / Math.LN2),
			zoomH = Math.round(Math.log(mapH * 360 / angleH / GLOBE_HEIGHT) / Math.LN2),
			zoom = Math.max(zoomW, zoomH) - 1;

		m.setZoom(zoom, { animate: false });
    };

    return {
        syncMapsOnMove: syncMapsOnMove,
        exportLayers: exportLayers,
        zoomTo: zoomTo,
        zoomToCountry: zoomToCountry,
        getSLDfromCSS: getSLDfromCSS,
        fitWorldByScreen: fitWorldByScreen
    }

}();;
FM.Plugins = {

    _addfullscreen: function(_fenixmap, show) {
        if ( show ) {
            //$("#" + _fenixmap.mapContainerID).append("<div class='fm-icon-box-background fm-btn-icon fm-fullscreen'><div class='fm-icon-sprite fm-icon-fullscreen' id='"+ _fenixmap.suffix +"-fullscreenBtn'><div></div>");
           // FM.UIUtils.fullscreen(_fenixmap.suffix +"-fullscreenBtn", _fenixmap.mapContainerID);
            $("#" + _fenixmap.mapContainerID).append("<div class='fm-icon-box-background fm-btn-icon fm-fullscreen'><div class='fm-icon-sprite fm-icon-fullscreen' id='"+ _fenixmap.suffix +"-fullscreenBtn'><div></div>");
            FM.UIUtils.fullscreen(_fenixmap.suffix +"-fullscreenBtn", _fenixmap.options.gui.fullscreenID);
        }
    },

    _addlayercontroller: function(_fenixmap, show){
        if ( show )
            $("#" + this.suffix +"-controller").show();
        else
            $("#" + this.suffix +"-controller").hide();
    },

    _addgeosearch: function(_fenixmap, show) {
        if ( show && L.GeoSearch) {
            new L.Control.GeoSearch({
                provider: new L.GeoSearch.Provider.OpenStreetMap()
            }).addTo(_fenixmap.map);
        }
    },

    _addgeocoder: function(_fenixmap, show) {
        // TODO: should be load here dinamically the requires JS
        if ( show && L.Control.OSMGeocoder) {
            var osmGeocoder = new L.Control.OSMGeocoder();
            _fenixmap.map.addControl(osmGeocoder);
        }
    },

    _addmouseposition: function(_fenixmap, show) {
        if ( show && L.control.mousePosition) {
        	L.control.mousePosition().addTo(_fenixmap.map);
        }
    },

    _addexport: function(_fenixmap, show) {
        if ( show && L.Control.Export) {
        	_fenixmap.map.addControl(new L.Control.Export())
        }
    },

    _addzoomcontrol: function(_fenixmap, position) {
        var zoomControl = new L.Control.Zoom();
        zoomControl.setPosition('bottomright');
        _fenixmap.map.addControl(zoomControl);
    },

    _addprintmodule: function(_fenixmap, show) {
        if ( show && L.print)
            /** TODO: install print module **/
            var printProvider = L.print.provider({
                method: 'GET',
                url: 'http://hqlprfenixapp1.hq.un.fao.org:10090/geoserver/pdf',
                autoLoad: true,
                dpi: 254
            });
        var printControl = L.control.print({ provider: printProvider });
        _fenixmap.map.addControl(printControl);
    },

    _adddisclaimerfao: function(_fenixmap, show) {
        if ( show ) {
            var structure = FM.replaceAll(FM.guiMap.disclaimerfao, 'REPLACE', _fenixmap.suffix);
            $("#" + _fenixmap.suffix + '-container-map').append(structure);
            var text = '';
            switch(_fenixmap.options.lang.toUpperCase()) {
                case 'ES':
                    text = FM.guiMap.disclaimerfao_S;
                    break;
                case 'FR':
                    text = FM.guiMap.disclaimerfao_F;
                    break;
                default:
                    text = FM.guiMap.disclaimerfao_E;
                    break;
            }
            text = FM.replaceAll(text, 'REPLACE', _fenixmap.suffix);

            $("#" + _fenixmap.suffix + '-disclaimerfao').attr( "title", text);

            try {
                $("#" + _fenixmap.suffix + '-disclaimerfao').powerTip({placement: 'nw'});
            } catch (e) {

            }
        }
    },


    /**
     *
     *
     * TODO: handle the layer control on layer selection to make spatial query
     *
     * (i.e. if a layer has certain properties add the draw control and remove it when is deselected )
     *
     *
     **/
    _adddrawcontrol: function(_fenixmap, show) {
        if ( show && L.Control.Draw) {

            var drawnItems = new L.FeatureGroup();
            _fenixmap.map.addLayer(drawnItems);

            var drawControl = new L.Control.Draw({
                draw: {
                    position: 'topleft',
                    polygon: {
                        title: 'Draw a polygon!',
                        allowIntersection: false,
                        drawError: {
                            color: '#b00b00',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#662d91'
                        }
                    }
                },
                edit: {
                    featureGroup: drawnItems
                }
            });
            _fenixmap.map.addControl(drawControl);

            _fenixmap.map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                if (type === 'marker') {

                    layer.bindPopup('A popup!');
                    //console.log(layer.getLatLng());
                    //console.log(_fenixmap.map.options.crs.project(layer.getLatLng()));
                }
                //console.log("created " + e.layerType);
                l = layer;
                l.layerType = type;
                drawnItems.addLayer(layer);

                _fenixmap.spatialQuery(layer)

            });

            _fenixmap.map.on('draw:edited', function (e) {
                var layers = e.layers;
                var countOfEditedLayers = 0;
                layers.eachLayer(function(layer) {
                    countOfEditedLayers++;
                });
                //console.log("Edited " + countOfEditedLayers + " layers");
            });
        }
    },

    _addcontrolloading: function( _fenixmap, show) {
        if ( show && L.Control.loading) {
            var loadingControl = L.Control.loading({
                separate: true,
                position: 'topright'
            });
            _fenixmap.map.addControl(loadingControl)
        }
    }
}
;
FM.SpatialQuery = {

    /**
     *
     * Perform a GetFeautreInfo with a Joined Layer
     *
     * @param l
     * @param layerPoint
     * @param latlng
     * @param map
     */
    getFeatureInfoJoin: function(l, layerPoint, latlng, fenixmap) {
        // setting a custom popup if it's not available
        if (l.layer.customgfi == null ) FMDEFAULTLAYER.joinDefaultPopUp(l.layer)
        FM.SpatialQuery.getFeatureInfoStandard(l, layerPoint, latlng, fenixmap);
    },


    /**
     *
     * GetFeatureInfo standard (used to WMS GetFeatureInfoRequests)
     *
     * @param l
     * @param layerPoint
     * @param latlng
     * @param map
     */
    getFeatureInfoStandard: function(l, layerPoint, latlng, fenixmap) {

        // bind to leaflet map
        var map = fenixmap.map;

        // query parameters for the GFI
        var bounds = map.getBounds();
        var sw = map.options.crs.project(bounds.getSouthWest());
        var ne = map.options.crs.project(bounds.getNorthEast());
        var BBOX = (sw.x ) + ',' + (sw.y) +',' + (ne.x) + ',' + (ne.y);
        var WIDTH = map.getSize().x;
        var HEIGHT = map.getSize().y;
        var X = map.layerPointToContainerPoint(layerPoint).x;
        var Y = map.layerPointToContainerPoint(layerPoint).y;
        // TODO: check it because in theory it shouldn't be needed
        X = new Number(X);
        X = X.toFixed(0) //13.3714
        Y = new Number(Y);
        Y = Y.toFixed(0) //13.3714
        var url = fenixmap.options.url.MAP_SERVICE_GFI_STANDARD;
        //var url = FMCONFIG.BASEURL_MAPS  + FMCONFIG.MAP_SERVICE_GFI_STANDARD;
        url += '?SERVICE=WMS';
        url += '&VERSION=1.1.1';
        url += '&REQUEST=GetFeatureInfo';
        url += '&BBOX='+BBOX;
        url += '&HEIGHT='+HEIGHT;
        url += '&WIDTH='+WIDTH;
        url += '&X='+X;
        url += '&Y='+Y;
        url += '&FORMAT=image/png';
        url += '&INFO_FORMAT=text/html';

        // get the selected layer and layer values
        if ( l != '' && l != null ) {
            url += '&LAYERS=' + l.layer.layers;
            url += '&QUERY_LAYERS=' + l.layer.layers;
            url += '&STYLES=';
            // TODO: this should be loaded at runtime based on the projection used on the map?
            url += '&SRS=EPSG:3857';
            //l.layer.srs; //EPSG:3857
            url += '&urlWMS=' + l.layer.urlWMS;
            //  FM.SpatialQuery.getFeatureInfoJoinRequest(url, 'GET', null,latlng, map, outputID, l.layer.custompopup, l.layer.lang, l.layer.joindata);
            FM.SpatialQuery.getFeatureInfoJoinRequest(url, 'GET', latlng, map, l);
        }
        else {
            // alert('no layer selected')
        }
    },


    // TODO: use an isOnHover flag?
    getFeatureInfoJoinRequest: function(url, requestType, latlon, map, l) {
        var lang = l.layer.lang != null? l.layer.lang : map.options.lang;
        var _map = map;
        var _l = l;
        $.ajax({
            type: "GET",
            url: url,
            success: function(response) {
                // do something to response
                if ( response != null ) {
                    // rendering the output
                    var maxWidth = $('#' + _map._fenixMap.id).width() - 15;
                    var maxHeight = $('#' + _map._fenixMap.id).height() - 15;
                    var popup = new L.Popup({maxWidth: maxWidth, maxHeight: maxHeight});

                    /** TODO: do it MUCH nicer **/
                    var r = response;
                    if (_l.layer.customgfi) {
                        var joindata = _l.layer.joindata != null? _l.layer.joindata : _l.layer.data;
                        var result = FM.SpatialQuery.customPopup(response, _l.layer.customgfi, lang, joindata)
                        // TODO: handle multiple outputs
                        r = (result != null) ? result[0] : response;
                    }
                    else {
                        var result = FM.SpatialQuery.transposeHTMLTable(response, _l.layer.layertitle);
                        r = (result != null) ? result[0] : response;
                    }

                    // check if the output is an empty (geoserver) output
                    r = FM.SpatialQuery._checkGeoserverDefaultEmptyOutput(r);

                    // how to handle custom callback
                    if (_l.layer.customgfi) {
                        if (_l.layer.customgfi && _l.layer.customgfi.callback) ( _l.layer.customgfi.callback(r, _l.layer) )
                        if (_l.layer.customgfi && _l.layer.customgfi.output && _l.layer.customgfi.output.show) {
                            $('#' + _l.layer.customgfi.output.id).empty();
                            if (r) {
                                $('#' + _l.layer.customgfi.output.id).append(r);
                            }
                        }
                        if (_l.layer.customgfi && _l.layer.customgfi.showpopup) {
                            if (r) {
                                popup.setLatLng(latlon).setContent(r);
                                _map.openPopup(popup);
                            }
                        }
                    }
                    else {
                        if (r) {
                            popup.setLatLng(latlon).setContent(r);
                            _map.openPopup(popup);
                        }
                    }
                }
            }
        });
    },

    customPopup: function(response, custompopup, lang, joindata) {
        //console.log(custompopup);
        //console.log(lang);
        //console.log(custompopup.content[lang]);
        var values = this._parseHTML(custompopup.content[lang]);
        if ( values.id.length > 0 || values.joinid.length > 0) {
            var h = $('<div></div>').append(response);
            var responsetable = h.find('table');
            if ( responsetable) {
                return FM.SpatialQuery._customizePopUp(custompopup.content[lang], values, responsetable, joindata );
            }
        }

    },

    /** TODO: how to check it?  **/
    _checkGeoserverDefaultEmptyOutput: function(response) {
        return response;
    },

    _customizePopUp:function(content, values, responsetable, joindata) {
        var tableHTML = responsetable.find('tr');
        var headersHTML = $(tableHTML[0]).find('th');
        //console.log(tableHTML);
        //console.log(headersHTML);
        //console.log(joindata);
        var rowsData = [];

        // get only useful headers
        var headersHTMLIndexs = [];
        for ( var i=0;  i < headersHTML.length; i ++) {
            //console.log("-----")
            //console.log(headersHTML[i])
            for (var j=0; j< values.id.length; j++) {
                //console.log("values.id")
                //console.log(values.id)
                if (values.id[j].toUpperCase() == headersHTML[i].innerHTML.toUpperCase()) {
                    headersHTMLIndexs.push(i);
                    break;
                }
            }
        }

        // this is in case the joinid is not empty TODO: split the code
        if ( joindata ) {
            var headersHTMLJOINIndexs = [];
            //console.log('values.joinid');
            //console.log(values.joinid);
            for ( var i=0;  i < headersHTML.length; i ++) {
                for (var j=0; j< values.joinid.length; j++) {
                    if ( values.joinid[j].toUpperCase() == headersHTML[i].innerHTML.toUpperCase()) {
                        headersHTMLJOINIndexs.push(i); break;
                    }
                }
            }
        }
        //console.log("headersHTMLJOINIndexs");
        //console.log(headersHTMLJOINIndexs);

        // get rows data
        for(var i=1; i<tableHTML.length; i ++) {
            rowsData.push($(tableHTML[i]).find('td'))
        }

        // create the response results
        var htmlresult = [];
//        console.log("rowsData");
//        console.log(rowsData);
        for( var j=0; j < rowsData.length; j++) {

            // this is done for each row of result (They could be many rows)
            var c = content;

            // Replace IDs
            for(var i=0; i<headersHTMLIndexs.length; i ++) {
                var header = '{{' + headersHTML[headersHTMLIndexs[i]].innerHTML + '}}'
                var d = rowsData[j][headersHTMLIndexs[i]].innerHTML;
                //console.log(d);
                c = FM.Util.replaceAll(c, header, d);
            }

            // Replace joindata (if needed)
            if ( joindata ) {
//                console.log("headersHTMLJOINIndexs");
//                console.log(headersHTMLJOINIndexs);

                for(var i=0; i<headersHTMLJOINIndexs.length; i ++) {
//                    console.log(headersHTML[headersHTMLJOINIndexs[i]].innerHTML);
                    var header = '{{{' + headersHTML[headersHTMLJOINIndexs[i]].innerHTML + '}}}'
//                    console.log("header");
//                    console.log(header);

                    var d = rowsData[j][headersHTMLJOINIndexs[i]].innerHTML;
                    var v = FM.SpatialQuery._getJoinValueFromCode(d, joindata);
//                    console.log(v);
                    c = FM.Util.replaceAll(c, header, v);
//                    console.log(c);
                }
            }

            // adding the row result to the outputcontent
            htmlresult.push(c)
        }
        //console.log(htmlresult)
        return htmlresult;
    },


    _getJoinValueFromCode: function(code, joindata) {
        //console.log("_getJoinValueFromCode");
        //console.log(code);
        //console.log(joindata);
        //TODO: do it nicer: the problem on the gaul is that the code is a DOUBLE and in most cases it uses an INTEGER
        var integerCode = ( parseInt(code) )? parseInt(code): null
        //console.log(integerCode);
        var json = ( typeof joindata == 'string' )? $.parseJSON(joindata) : joindata;
        //console.log(json);
        for(var i=0; i< json.length; i++) {
            if ( json[i][code] || json[i][integerCode] ) {
                if ( json[i][code] ) {
                    //console.log( json[i][code]);
                    return json[i][code];
                }
                else {
                    //console.log( json[i][integerCode]);
                    return json[i][integerCode];
                }
            }
        }
        return '';
        //return 'No data available for this point';
    },

    /**
     *
     * Get all {{value}}
     * @private
     */
    _parseHTML: function(content) {
        var values = {};
        values.id = [];
        values.joinid = [];

        //console.log(content);
        var array = content.match(/\{\{.*?\}\}/g);
        for (var i=0; i < array.length; i++) {
            array[i] = FM.Util.replaceAll(array[i], "{{", "");
            array[i] = FM.Util.replaceAll(array[i], "}}", "");

            // if it contains $ (this means that is a joinid
            if ( array[i].indexOf('{') >= 0 ) {
                array[i] = FM.Util.replaceAll(array[i], "{", "");
                array[i] = FM.Util.replaceAll(array[i], "}", "");
                values.joinid.push(array[i]);
            }
            else {
                values.id.push(array[i]);
            }
        }
        return values;
    },

    transposeHTMLTable: function(response, layertitle){
        /** TODO: make it nicer **/
        var h = $('<div></div>').append(response);
        var table = h.find('table');
        var result = [];
        if ( table ) {
            var r = FM.SpatialQuery.transposeHTML(table, layertitle)
//            console.log(r);
            if ( r != null ) return r;
        }
        return null;
    },

    transposeHTML:function(table, layertitle) {
        var div = $('<div class="fm-transpose-popup"></div>');
        var titleHTML = table.find('caption');
        try {
//            div.append(titleHTML[0].innerHTML)
            div.append(layertitle)

            var tableHTML = table.find('tr');

            var headers = $(tableHTML[0]).find('th');
            var rowsData = [];
            for ( var i =1;  i < tableHTML.length; i ++) {
                rowsData.push($(tableHTML[i]).find('td'))
            }

            var t = $('<table></table>');
            var tb = $('<tbody></tbody>');
            for( var i =0; i < headers.length; i++) {
                var tr = '<tr>';
                var td = '<td>' + headers[i].innerHTML + '</td>';
                for(var j = 0; j < rowsData.length; j++) {
                    td += '<td>' +rowsData[j][i].innerHTML + '</td>';
                }
                tr += td;
                tr += '</tr>';
                tb.append(tr);
            }
            return div.append(t.append(tb));
        } catch (e) {
            return null;
        }
    },


    /**
     * @param l
     * @param fenixMap
     * @param series
     * @param xmin
     * @param xmax
     * @param ymin
     * @param ymax
     * @param zoomToFeatures
     * @param layer used to highlight/filter the features
     */
    scatterLayerFilter:function(l, fenixMap, series, xmin, xmax, ymin, ymax, zoomToFeatures, layerHighlight, reclassify ) {

        // TODO: make a better function (this is to avoid that when the data are requested the values are empty)
        // if the layer is not defined OR if it's needed to reclassify the data are inserted again
        if ( !l.leafletLayer || reclassify ) l.layer.joindata = [];

        var spCodes = '';
        for(var i=0; i < series.length; i++) {
            if ( series[i].data[0][0] >= xmin && series[i].data[0][0] <= xmax && series[i].data[0][1] >= ymin && series[i].data[0][1] <= ymax )  {
                var geocode =  series[i].geocode;
                if ( spCodes != '') spCodes += ','
                if ( geocode) spCodes += "'"+ geocode +"'"
                var s = {};
                var value = series[i].data[0][0] / series[i].data[0][1];
                s[series[i].geocode] = value;

                // TODO: make a better function (this is to avoid that when the data are requested the values are empty)
                // if the layer is not defined OR if it's needed to reclassify the data are inserted again
                if ( !l.leafletLayer || reclassify ) l.layer.joindata.push(s);
            }
        }

        // TODO: make a better function (this is to avoid that when the data are requested the values are empty)
        // if the layer is not defined OR if it's needed to reclassify the data are inserted again
        if ( !l.leafletLayer || reclassify )  l.layer.joindata = JSON.stringify(l.layer.joindata);

        if (l.leafletLayer ) {
            // Highlight the layer (if exist)
            if ( layerHighlight ) FM.SpatialQuery.highlightFeaturesOfLayer(layerHighlight, spCodes);

            // reclassify the layer
            if ( reclassify ) fenixMap.createShadeLayerRequest(l, true);

            // SPATIAL QUERY
            if ( zoomToFeatures ) {
                FM.SpatialQuery._sampleSpatialQueryBoundingBox(fenixMap.map, spCodes, l.layer);
                //FM.SpatialQuery._sampleSpatialQueryCentroid(fenixMap.map, spCodes)
            }

        }
        else {
            fenixMap.addShadedLayer(l);
            //fenixMap.addLayer(l);
        }
    },

    scatterLayerFilterFaster:function(l, fenixMap, series, xmin, xmax, ymin, ymax, layerHighlight, reclassify, formula) {
        console.log('----------scatterLayerFilterFaster');
        console.log(formula);
        console.log(series);
        console.log(l);
        console.log(layerHighlight);
        var zoomToFeatures = ( l.layer.zoomToFeatures )?  l.layer.zoomToFeatures : false;
        if ( !l.leafletLayer || reclassify ) l.layer.joindata = [];

        var spCodes = '';
        for(var i=0; i < series.length; i++) {
            //console.log('-->' + series[i]);
            for ( var j = 0; j < series[i].data.length; j++) {
                //console.log('---->' + series[i].data[j]);
                if ( series[i].data[j].x >= xmin && series[i].data[j].x <= xmax && series[i].data[j].y >= ymin && series[i].data[j].y <= ymax )  {
                    var code =  series[i].data[j].code;
                    if ( spCodes != '') spCodes += ','
                    if ( code) spCodes += "'"+ code +"'"
                    var s = {};

                    // console.log('-->data: ' + series[i].data[j]);
                    //console.log('-->code: ' + code);

                    /* TODO: remove eval **/
                    if ( series[i].data[j].x != 0 && series[i].data[j].y != 0) {
                        var value = ( formula )? eval(formula) : series[i].data[j].x / series[i].data[j].y;

                        s[series[i].data[j].code] = value;

                        // TODO: make a better function (this is to avoid that when the data are requested the values are empty)
                        // if the layer is not defined OR if it's needed to reclassify the data are inserted again
                        if ( !l.leafletLayer || reclassify ) l.layer.joindata.push(s);

                    }
                }
            }
        }

        //console.log('END---');

        // this is to filter the result output without getting all the polygons, just the ones needed
        // TODO add a parameter to enable or disable this feature on the layer
        // if ( spCodes ) l.layer.cql_filter= l.layer.joincolumn +" IN (" + spCodes + ")";

        // TODO: make a better function (this is to avoid that when the data are requested the values are empty)
        // if the layer is not defined OR if it's needed to reclassify the data are inserted again
        if ( !l.leafletLayer || reclassify )  l.layer.joindata = JSON.stringify(l.layer.joindata);

        if (l.leafletLayer ) {
            // Highlight the layer (if exist)
            if ( layerHighlight ) FM.SpatialQuery.highlightFeaturesOfLayer(layerHighlight, spCodes);

            // reclassify the layer
            if ( reclassify ) fenixMap.createShadeLayerRequest(l, true);

            // SPATIAL QUERY
            if ( zoomToFeatures ) {
                FM.SpatialQuery._sampleSpatialQueryBoundingBox(fenixMap.map, spCodes, l.layer);
                //FM.SpatialQuery._sampleSpatialQueryCentroid(fenixMap.map, spCodes)
            }

        }
        else {
            fenixMap.addShadedLayer(l);
            //fenixMap.addLayer(l);
        }
    },

    // Highlight the features (it's passed not '10','15' that has to be converted)
    highlightFeaturesOfLayer:  function(l, codes) {
        console.log('highlightFeaturesOfLayer')
        console.log(l)
        console.log(codes)
        var codes = FM.Util.replaceAll(codes, "'", "");


        l.layer.cql_filter = l.layer.joincolumn + " IN (" + codes + ")";
//        console.log(l.layerAdded)
        if ( l.layerAdded )
            l.redraw();
        else
            l.addLayerWMS();
    },

    _sampleSpatialQueryBoundingBox: function(map, spCodes, layer) {
        //console.log(map);
        var data = {};
        data.datasource = 'FENIX';
        // default geometry column if it doesnt exist TODO: launch an alert in case
        var geom = (layer.geometrycolumn) ? layer.geometrycolumn : 'geom'
        data.select = 'ST_AsText(ST_Transform(ST_Envelope(ST_Collect(' + layer.geometrycolumn + ')), 4326)) ';
        /* data.from = 'gaul0_faostat_3857';
         data.where = "faost_code IN (" + spCodes + ") "*/
        data.from = ( layer.layername)? layer.layername : layer.layers;
        data.where = layer.joincolumn + " IN (" + spCodes + ") " ;
        $.ajax({
            type : 'POST',
            // url :  FMCONFIG.BASEURL_WDS + FMCONFIG.WDS_SERVICE_SPATIAL_QUERY,
            url :  map.options.url.WDS_SERVICE_SPATIAL_QUERY,
            data : data,
            success : function(response) {
                //console.log(response);
                var wkt = new Wkt.Wkt();
                wkt.read(response)
                //console.log(wkt)
                var BBOX = {
                    "xmin" : wkt.components[0][0].x,
                    "xmax" : wkt.components[0][2].x,
                    "ymax" : wkt.components[0][1].y,
                    "ymin" : wkt.components[0][0].y
                }
                FM.LayerUtils.zoomTOBBOX(map, BBOX);
            },
            error : function(err, b, c) { }
        });
    },

    _sampleSpatialQueryCentroid: function(map, spCodes) {
        var data = {};
        data.datasource = 'FENIX',
            data.select = 'ST_AsText(ST_Transform(ST_Centroid(ST_Collect(geom)), 4326)) ';
        data.from = 'gaul0_faostat_3857';
        data.where = "faost_code IN (" + spCodes + ") "
        $.ajax({
            type : 'POST',
            url :  map.config.url.WDS_SERVICE_SPATIAL_QUERY,
            data : data,
            success : function(response) {
                //console.log(response);
                var wkt = new Wkt.Wkt();
                wkt.read(response)
//                console.log("WKT:");
//                console.log(wkt)
                map.panTo([wkt.components[0].y,wkt.components[0].x]);
            },
            error : function(err, b, c) { }
        });
    },

    filterLayerMinEqualThan: function(l, value) {
        FM.LayerUtils.filterLayerMinEqualThan(this, l, value);
    },

    filterLayerGreaterEqualThan:function(l, value) {
        FM.LayerUtils.filterLayerGreaterEqualThan(this, l, value);
    },

    filterLayerInBetweenEqualThan:function(l, min, max) {
        FM.LayerUtils.filterLayerInBetweenEqualThan(this, l, min, max);
    },

    filterLayerOuterEqualThan:function(l, min, max) {
        FM.LayerUtils.filterLayerOuterEqualThan(this, l, min, max);
    }

};
FM.Layer = FM.Class.extend({

    _fenixmap: '',

    id : '',

    //layer: '',

    layer: {
        // WMS default parameters
        styles:'', // could be better 'styles' to be passed directory to the WMS parameters
        srs : 'EPSG:3857',
        visibility: true, //enabled/disabled layer and also to the wms request
        format: "image/png", // ["image/png", "image/gif"]
        transparent: 'TRUE', //[TRUE, FALSE]
        opacity: 1,
        // Other Options
        name: '',
        tiitle: '',
        abstract: '',
        srs: '',
        LatLonBoundingBox: '',
        BoundingBox: '',
        Style: {
            name: '',
            title: '',
            abstract: '',
            legendurl: {
                format: '',
                onlineresource: '' //differenct xml attributes (how to store it?
            }
        },
        KeywordList: [],

        layertitle: '',
        enablegfi: true,
        layertype: 'WMS', //['WMS', 'JOIN']
        openlegend: false,

        // JOIN default options
        switchjointype: false,

        // language
        lang: 'EN' //ISO2

    },

    leafletLayer: '',

    initialize: function(layer, options) { // (HTMLElement or String, Object)
        this.layer = $.extend(true, {}, this.layer, layer);

        if ( options) this.options = options;

        this.id = FM.Util.randomID();

        if ( layer.joindata ) layer.defaultdata = layer.joindata;
    },

    createLayerWMS: function() {

        var wmsParameters = this._getWMSParameters();
        if ( this.leafletLayer ) {
            this.leafletLayer.setParams(wmsParameters);
        }
        else {
            wmsParameters = (this.options)? $.extend(true, {}, this.options, wmsParameters): wmsParameters;
            this.leafletLayer = new L.TileLayer.WMS( this.layer.urlWMS, wmsParameters );
        }
        return this.leafletLayer;
    },

    createLayerWMSSLD: function() {
        var wmsParameters = this._getWMSParameters();
        if ( this.leafletLayer ) {
            this.leafletLayer.setParams(wmsParameters);
        }
        else {
            this.leafletLayer = new L.TileLayer.WMS( this.layer.urlWMS, wmsParameters );
        }
        return this.leafletLayer;
    },

    /** TODO: make also the other parameters dynamic **/
    _getWMSParameters:function() {
        var options = {};

        options.id = this.id;

        // can be used layers (default WMS parameter or layername)
        options.layers = ( this.layer.name )?  this.layer.name: this.layer.layers;
        options.format= this.layer.format;
        options.transparent = this.layer.transparent.toUpperCase();
        options.visibility = this.layer.visibility;
        options.opacity = this.layer.opacity;

        /** TODO: handle additional parameters that are not default ones **/
        /** i.e. http://nyc.freemap.in/cgi-bin/mapserv?MAP=/www/freemap.in/nyc/map/basemap.map **/

        // check whether styles or style is set (styles is the default URL parameter)
        options.styles=this.layer.styles;
        if ( this.layer.style ) options.styles = this.layer.style;
        if ( this.layer.sldurl ) options.sld = this.layer.sldurl;
        if ( this.layer.cql_filter ) options.cql_filter = this.layer.cql_filter;
        if ( this.layer.sld_body ) options.sld_body = this.layer.sld_body;
        this.layer.layers = ( this.layer.layername )?  this.layer.layername: this.layer.layers;

        return options;
    },

    // this is just to use with the WMS Layers // check layer type
    redraw: function(fenixmap) {
        var l = this;
        if (l.layer.layertype ) {
            switch(l.layer.layertype ) {
                case 'JOIN':
                    if (l.layer.jointype.toLocaleUpperCase() == 'SHADED') {
                        if ( fenixmap ) fenixmap.addLayer(this);
                        else if ( this._fenixmap ) this._fenixmap.addLayer(this);
                    }
                    else if (l.layer.jointype.toLocaleUpperCase() == 'POINT')
                        console.log('TODO: handle redraw point');
                    break;
                case 'WMS':
                    this.createLayerWMS();
                    this.leafletLayer.redraw();
                    break;
                default:
                    this.createLayerWMS();
                    this.leafletLayer.redraw();
                    break;
            }
        }
    },

    /** TOODO: remove layer also from the layers list **/
    removeLayer: function(fenixmap) {
        /** TODO: remove it from the list **/
        if ( fenixmap )
            fenixmap.removeLayer(this);
        else if ( this._fenixmap)
            this._fenixmap.removeLayer(this);
    },

    /** shortcut **/
    addPointLayer: function(fenixmap) {
        if ( fenixmap )
            fenixmap.addPointLayer(this);
        else if ( this._fenixmap)
            this._fenixmap.addPointLayer(this);
    },

    addLayerWMS: function(fenixmap) {
        if ( fenixmap )
            fenixmap.addLayerWMS(this);
        else if ( this._fenixmap)
            this._fenixmap.addLayerWMS(this);
    },

    addLayer: function(fenixmap) {
        if ( fenixmap )
            fenixmap.addLayer(this);
        else if ( this._fenixmap)
            this._fenixmap.addLayer(this);
    },

    addShadedLayer: function(fenixmap) {
        if ( fenixmap )
            fenixmap.addShadedLayer(this);
        else if ( this._fenixmap)
            this._fenixmap.addShadedLayer(this);
    },

    createShadedLayerRequestCached:function (fenixmap) {
        if ( fenixmap ) {
            fenixmap.controller.layerAdded(this);
            fenixmap.createShadedLayerRequestCached(this);
        }
        else if ( this._fenixmap) {
            this._fenixmap.controller.layerAdded(this);
            this._fenixmap.createShadedLayerRequestCached(this);
        }
    },

    /**
     * this method just request the layer, so it's been cached
     *
     * @param l
     * @param isReload
     */
    createShadeLayerRequestCached: function(fenixmap, loadLayer) {

      if ( this._fenixmap )
            fenixmap = this._fenixmap;
      //  TODO: change to jquery
      var l = this;
        var r = new RequestHandler();
        var url = fenixmap.options.url.MAP_SERVICE_SHADED;
        r.open('POST', url);
        r.setContentType('application/x-www-form-urlencoded');
        r.onload(function () {
            var response = this.responseText;
            if (typeof response == 'string') {
                response = $.parseJSON(response);
            }
            l.layer.sldurl = response.sldurl;
            l.layer.urlWMS = response.geoserverwms;
            l.layer.legendHTML = response.legendHTML;
            l.createLayerWMSSLD();

            if ( loadLayer ) {
                fenixmap.controller.layerAdded(l);
                fenixmap._loadLayer(l, false)
            }
        });
        r.send(FM.Util.parseLayerRequest(l.layer));
    }

});

FM.layer = function (layer, map, options) {
    return new FM.Layer(layer, map, options);
};


;
FM.TileLayer = FM.Layer.extend({

    createTileLayer: function() {
       var tileTitle = 'TITLE_' + this.layer.lang.toUpperCase();
       var layer = (this.layer.layername)? FM.TILELAYER[this.layer.layername]: FM.TILELAYER[this.layer.layers];
       this.layer.layertitle = {};
       this.layer.layertitle = layer[tileTitle];
       this.layer.layertype= 'TILE';
       var leafletLayer =  new L.TileLayer(layer.URL);
       return leafletLayer;
    }

});

FM.TileLayer.createBaseLayer = function (layername, lang) {
    var layer = {};
    // this is replicated because in wms it's used "layers" instead of layername
    layer.layername = layername;
    layer.layers = layername;
    layer.layertype ='TILE';
    layer.lang = lang;
    var l = new FM.TileLayer(layer);
    l.leafletLayer = l.createTileLayer(layer.layername);
    return l;
};

// TODO: create a method to import an dependencies baselayer