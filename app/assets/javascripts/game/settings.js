
(function ($) {

    var Settings = function(config) {
        this._init(config);
    };

    Settings.prototype = {
        _defaultConfig: {
            fontSize: 14
        },

        _init: function(config) {
            this._config = $.extend({}, this._defaultConfig, config);
        },

        fontHeight: function() {
            return this._config.fontSize;
        },

        fontWidth: function() {
            return this.fontHeight() * 3.0 / 5.0; // Having a width that is 3/5 of the height is standard for monospace text
        }
    };

    BountyHunter.namespace('Game').Settings = Settings;

}(jQuery));