/**
 * Initialization callbacks for document and panel loading
 */
(function($) {
    'use strict';

    var initializers = BountyHunter.namespace("Init");

    initializers.callbacks = {};

    initializers.register = function(key, callback) {
        //console.log('Registering initializer for ' + key);
        if(key in initializers.callbacks) {
            //console.log('  !! - Initializer already exists for ' + key);
        }

        initializers.callbacks[key] = callback;
    };

    initializers.onLoad = function(key) {
        var params = [].slice.call(arguments).slice(1);
        var $target = params[0];

        if ($target && $target.isStale()) {
            //console.log('Ignoring initializer for '+key +' (stale)');
            return;
        }

        if (key in initializers.callbacks) {
            //console.log('Firing initializer for ' + key);
            initializers.callbacks[key].apply(this, params);
        }
        else {
            //console.log('No initializer for ' + key);
        }
    };

}(jQuery));


/*
 * Page initialization code
 */
(function ($) {
    'use strict';

    function setupWindowResize() {
        // This causes a $(window).on('resizeEnd') event to be fired after resizing the window
        $(window).on('resize', function() {
            var RESIZE_DEBOUNCE_TIME = 500;

            if(this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }

            this.resizeTimeout = setTimeout(function() {
                $(this).trigger('resizeEnd');
            }, RESIZE_DEBOUNCE_TIME);
        });
    }

    function doDocumentInit() {
        var $document = $(document);

        //BountyHunter.Init.onLoad('body.' + $('body').attr('class'), $document);
        BountyHunter.Init.onLoad('application', $document);
        $document.foundation();
    }

    $(function() {
        //setupWindowResize();
        doDocumentInit();
    });
}(jQuery));


