
/*
 Notes:
 Be careful any time you use < or <= or > or >=. Need to round any floating point numbers

 */


(function($){

    var Main = function() {
        this._init();
    };

    Main.prototype = {

        _init: function() {
            // Store Game Settings globally
            BountyHunter.namespace('Global'); // Init Global namespace
            BountyHunter.Global.resource_engine = new BountyHunter.Game.ResourceEngine();
            BountyHunter.Global.settings = new BountyHunter.Game.Settings({
                fontSize: 16
            });
            BountyHunter.Global.statistics = new BountyHunter.Game.Statistics();
            BountyHunter.Global.time = 0;

            this._setupTiming();
            this._setupIO();

            this._createPeriodicFn(BountyHunter.Utilities.makeCallback(this, this._updateResources),
                1000 / BountyHunter.Game.Constants.resourceUpdatesPerSecond);

            this._runGame();
        },

        _setupTiming: function() {
            var self = this;

            /*. Fallback support, window.requestAnimationFrame isn't fully supported by all browsers .*/
            window.requestFrame = (function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    function (c) {
                        window.setTimeout(c, 50);
                    };
            })();

            /*. Time based variables, all in milliseconds .*/
            this._timing = {
                now: Date.now() || (new Date).getTime(), // Current tick's time
                then: Date.now() || (new Date).getTime(), // Last tick's time
                delta: 0, // Time since last tick
                total: 0, // Total time elapsed
                periodicFns: [] // functions to call periodically
            };

            /*. Main function .*/
            this._runGame = function () {
                /*. Calculate time since last tick .*/
                self._timing.now = Date.now() || (new Date).getTime(); // Get current time
                self._timing.delta = self._timing.now - self._timing.then; // Get time since last tick
                self._timing.then = self._timing.now; // Reset last tick time
                self._timing.total += self._timing.delta;

                BountyHunter.Global.time = self._timing.total;
                self._iteratePeriodicFns();

                /*. Run function again as soon as possible without lagging .*/
                window.requestFrame(self._runGame);
            };
        },

        _setupIO: function() {
            this._keyboard = new BountyHunter.IO.Keyboard();
        },



        // ---------------------------------------------------------------- Periodic functions
        // Note: period is in seconds

        _updateResources: function(iterations, period) {
            var fps = (1000 / this._timing.delta).toFixed(1);
            var total = (this._timing.total / 1000).toFixed(0);

            $('#fps').text(fps);
            $('#total-time').text(total);

            BountyHunter.Global.resource_engine.update(iterations, period);
        },

        // ---------------------------------------------------------------- Periodic function helpers
        // A periodic function does not run every game loop, it runs every X milliseconds (to improve performance)

        _createPeriodicFn: function(fn, period, cache) {
            cache = BountyHunter.Utilities.defaultFor(cache, false);

            this._timing.periodicFns.push({
                fn: fn,
                period: period,
                current: period,
                cache: cache
            });
        },

        _iteratePeriodicFns: function() {
            var delta = this._timing.delta;

            $.each(this._timing.periodicFns, function(index, periodicFn) {
                periodicFn.current += delta;
                if (periodicFn.current >= periodicFn.period) {
                    if (periodicFn.cache) {
                        periodicFn.current -= periodicFn.period;
                        periodicFn.fn();
                    }
                    else {
                        var iterations = 0;
                        while (periodicFn.current >= periodicFn.period) {
                            iterations += 1;
                            periodicFn.current -= periodicFn.period;
                        }
                        periodicFn.fn(iterations, periodicFn.period / 1000.0); // period is converted to seconds for fns
                    }
                }
            });
        }

    };

    BountyHunter.Init.register('application', function($panel) {
        $panel.data('main', new Main($panel));
    });

})(jQuery);
