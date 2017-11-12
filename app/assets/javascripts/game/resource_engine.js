
(function ($) {

    var ResourceEngine = function() {
        this._init();
    };
    ResourceEngine.prototype = {

        _init: function() {
            this._baseResource = 0;
        },

        update: function(iterations, period) { // period is in seconds

            while (iterations > 0) {
                iterations--;
                this._baseResource += 1.0 * period; // 1 per second
            }

            this.refreshView();
        },

        refreshView: function() {
            $('#base-resource').text(this._baseResource);
        }
    };

    BountyHunter.namespace('Game').ResourceEngine = ResourceEngine;

}(jQuery));