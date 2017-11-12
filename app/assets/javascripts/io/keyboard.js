
(function($) {

    var Keyboard = function() {
        this._init();
    };
    Keyboard.prototype = {
        keysDown: {},

        _init: function() {
            var self = this;

            $(document).off('keydown').on('keydown', function(evt) {
                if (evt.keyCode >= 37 && evt.keyCode <= 40) {
                    evt.preventDefault();
                }
                self.keysDown[evt.keyCode] = true;
            });

            $(document).off('keyup').on('keyup', function(evt) {
                if (evt.keyCode >= 37 && evt.keyCode <= 40) {
                    evt.preventDefault();
                }
                delete self.keysDown[evt.keyCode];
            });
        }
    };

    BountyHunter.namespace('IO').Keyboard = Keyboard;

}(jQuery));

