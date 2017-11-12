
(function($) {
    'use strict';


    var util = BountyHunter.namespace("Utilities");

    // ---------------- Change element's visibility (like show/hide except the element still takes up space)

    $.fn.visible = function() {
        return this.css('visibility', 'visible');
    };

    $.fn.invisible = function() {
        return this.css('visibility', 'hidden');
    };

    $.fn.visibilityToggle = function(state) {
        if ( typeof state === "boolean" ) {
            return state ? this.visible() : this.invisible();
        }

        return this.css('visibility', function(i, visibility) {
            return (visibility === 'visible') ? 'hidden' : 'visible';
        });
    };

    // ---------------- Element exists
    $.fn.elementExists = function() {
        return this.length !== 0;
    };

    // Checks whether element is actually still in DOM, or if it's just cached
    $.fn.isStale = function() {
        // Note: document.contains() does not work in Internet Explorer (IE does not consider the document an element)
        return this[0] !== document && !document.body.contains(this[0]);
    };

    // ---------------- Toggle checkbox if it wasn't the target of the event
    // (e.g. checkbox is in an li element, and the li was clicked)
    $.fn.toggleCheckboxIfNeeded = function(evt) {
        if (evt.target !== this[0]) {
            this.prop('checked', !this.prop('checked'));
        }
    };

    $.fn.onReturnKey = function(onReturn) {
        this.keyup(function(evt) {
            if (evt.keyCode === 13) {
                onReturn();
            }
        });
    };

    // If disable === true, all options except for the one selected will be disabled. If disable === false, enables all options.
    // Useful when disabling a select, because if you disable the select itself, it won't be sent to server on submit
    // (unless you want to do some hidden field micky mousing)
    $.fn.disableOptions = function(disable) {
        this.find('option:selected').prop('disabled', false);
        this.find('option:not(:selected)').prop('disabled', disable);
        return this;
    };

    $.fn.firstOption = function() {
        return this.find('option:first').val();
    };

    $.fn.jQueryTooltip = function(tooltipParams) {
        var $tip = this.tooltip($.extend({}, {
            content: function() {
                return $(this).prop('title');
            }
        }, tooltipParams));

        $("div.ui-helper-hidden-accessible").remove(); // Get rid of extra elements (performance)

        return $tip;
    };

    $.fn.clickableTooltip = function(tooltipParams, onOpen) {
        return this.jQueryTooltip($.extend({}, {
            open: function(event, ui) {
                if (typeof(event.originalEvent) === 'undefined') {
                    return false;
                }

                var $tooltip = $(ui.tooltip);

                $('div.ui-tooltip').not('#' + $tooltip.attr('id')).remove(); // Close any lingering tooltips

                $("div.ui-helper-hidden-accessible").remove(); // Get rid of extra elements (performance)

                onOpen($tooltip, $(event.relatedTarget));
            },
            close: function(event, ui) {
                // Keep tooltip if being hovered over, so user can click links
                ui.tooltip.hover(function() {
                        // Hover-over
                        $(this).stop(true).fadeTo(500, 1);
                    },
                    function() {
                        // Hover-out
                        $(this).fadeOut('500', function() {
                            $(this).remove();
                        });
                    });
            },
            show: null // Show immediately
        }, tooltipParams));
    };

    util.closeJqueryTooltips = function() {
        $('div.ui-tooltip').remove();
    };


    // --------------------------- Toasts

    // Store all toasts in an object so we can prevent duplicates
    var toasts = {};

    // Some notes on the 'params' argument:
    //      - Do not override the afterHidden param. If you need to override it, this is going to have to be changed.
    //      - If you add an afterShown handler for onClick events, make sure to bind to the $toast element, not the $link itself
    //          (see network_connection.js for an example)
    util.errorToast = function(id, params) {
        var defaultParams = {
            text: 'Default text',

            icon: 'warning',
            showHideTransition: 'fade',
            allowToastClose: true,
            hideAfter: 5000,
            //stack: false,
            position: { top: 65, right: 20 },
            bgColor: '#a94442',

            textAlign: 'left',
            loader: false,

            afterHidden: function() {
                delete toasts[id];
            }
        };

        params = $.extend({}, defaultParams, params);

        if (toasts[id]) {
            toasts[id].update(params);
        }
        else {
            toasts[id] = $.toast(params);
        }
    };

    util.hideToast = function(id) {
        if (toasts[id]) {
            // TODO HACK Unfortunately this requires a modification to jquery.toast.js
            // Have to make allowToastClose affect just the 'visibility' of the close link (link needs to always exist)
            toasts[id].close();
        }
    };

    // ---------------------------


    util.makeCallback = function (target, method) {
        return function () {
            return method.apply(target, arguments);
        };
    };

    // Iterates through the keys of the object, calling the given function on each (key, value) pair
    util.iterateObject = function(obj, fn, thisArg) {
        if (obj) {
            Object.keys(obj).forEach(function(key) {
                fn.call(thisArg, key, obj[key]);
            }, this);
        }
    };

    util.currentOrgId = function() {
        return $('#current_org_id').val();
    };

    util.currentUserId = function() {
        return parseInt($('#current_user_id').val());
    };

    // Will return defaultValue if arg undefined, or if arg is an element of badValues. Otherwise returns arg.
    util.defaultFor = function (arg, defaultValue, badValues) {
        var useDefault = false;

        if ($.isArray(badValues)) {
            $.each(badValues, function(index, value) {
                if (arg === value) {
                    useDefault = true;
                }
            });
        }

        return (typeof arg === 'undefined' || useDefault) ? defaultValue : arg;
    };

    util.scrollToTop = function() {
        $('html, body').animate({ scrollTop: 0 }, "slow");
    };


    // ----------------- Set <=> Array

    // Warning: Not all browsers support the following:
    //      new Set([1,2,3]);
    //      Array.from(set);
    //      [...set]

    // Also, mozilla's polyfill for Array.from (https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill)
    // doesn't work for Sets (Sets will require a more advanced polyfill).
    // So using these instead for now:

    util.arrayToSet = function(array) {
        if (array instanceof Set) {
            return array;
        }

        var s = new Set();
        if (array) {
            array.forEach(function(element) {
                s.add(element);
            });
        }
        return s;
    };

    util.setToArray = function(setObject) {
        if (setObject instanceof Array) {
            return setObject;
        }

        var arr = [];
        if (setObject) {
            setObject.forEach(function(element) {
                arr.push(element);
            });
        }
        return arr;
    };

    // -----------------

    util.secondsToHourString = function (seconds, minuteGranularity) {
        minuteGranularity = util.defaultFor(minuteGranularity, true);

        var militaryTime = (seconds / (60 * 60)) % 24;
        var militaryHour = Math.floor(militaryTime);
        var minutes = ("0" + (militaryTime % 1) * 60).slice(-2);
        var period = (militaryHour < 12) ? "AM" : "PM";
        var hour = (militaryHour % 12 === 0) ? 12 : militaryHour % 12;
        return (minuteGranularity) ? hour + ":" + minutes + " " + period : hour + ":00 " + period;
    };

    // ----------- TODO hack for viewing other timezones in d3
    //  Javascript Date objects are limited to the browser's timezone or UTC. To get around this, this function can be
    //  used to show times as if the viewer's browser were in other timezones.
    //
    //  E.g. If a Hawaii user is viewing a 9:00 AM California time (09:00 -0700), this function returns (09:00 -1000).
    //       Thus, the time will appear to the Hawaii user as 9:00 AM (even though it was actually 6:00 AM Hawaii time).
    //
    //  When to use: Before processing a date/time from the server (e.g. before sending a time to d3), pass it through
    //               this function.
    // -----------
    util.dateForTimezone = function(date, timezone) {
        // Create a moment for the appropriate timezone (e.g. 09:00 -0700), then leave off the timezone (09:00) and
        // create a new moment which will be in the browser's timezone (09:00 -1000)
        return timezone ? moment(moment(date).tz(timezone).format('YYYY-MM-DD HH:mm:ss')) : moment(date);
    };

    util.objectSize = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                size++;
            }
        }
        return size;
    };

    util.renameObjectKey = function (obj, oldKey, newKey) {
        if (oldKey !== newKey) {
            Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
            delete obj[oldKey];
        }
    };

    util.isString = function(obj) {
        return (typeof obj === 'string' || obj instanceof String);
    };

    // Creates an array of length 'length', with each element set to be 'initialValue'
    util.createArray = function(length, initialValue) {
        initialValue = util.defaultFor(initialValue, null);

        var array = [];
        for (var i = 0; i < length; i++) {
            array.push(initialValue);
        }

        return array;
    };

    util.arrayDifference = function (mainArray, subtractedArray) {
        return mainArray.filter(function(i) {
            return subtractedArray.indexOf(i) < 0;
        });
    };

    // Similar to jQuery's inArray, but returns true/false instead of array index
    util.inArray = function(item, array) {
        return array && $.inArray(item, array) !== -1;
    };

    util.arraysEqual = function(array1, array2) {
        if (array1 === array2) {
            return true;
        }
        if (array1 === null || array2 === null) {
            return false;
        }
        if (array1.length !== array2.length) {
            return false;
        }

        for (var i = 0; i < array1.length; ++i) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };

    // Rounds a number to a good amount of decimals
    util.formattedDecimal = function(number) {
        var result;
        var magnitude = Math.abs(number);

        if (magnitude >= 1000) {
            result = number.toFixed(0);
        }
        else if (magnitude >= 100) {
            result = number.toFixed(1);
        }
        else if (magnitude > 0) {
            result = number.toFixed(2);
        }
        else {
            result = number;
        }

        return util.numberWithCommas(result);
    };

    // Adds commas to break up large numbers: 12345.6789 => 12,345.6789
    util.numberWithCommas = function(number) {
        var parts = number.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Only apply commas to non-decimal part of number
        return parts.join(".");
    };

    // Encodes a set of params into a url format. Used in cases where ajax is not an option
    util.encodeParamsInUrl = function (url, params) {
        var encoding = '?';

        $.each(params, function(key, value) {
            encoding += (key + '=' + value + '&');
        });

        encoding = encoding.slice(0, -1); // Get rid of last '&'

        return url + encoding;
    };

    // E.g. '<strong>ABCDEF</strong>' => 'ABCDEF'
    util.removeHtmlTags = function (string) {
        var rex = /(<([^>]+)>)/ig;
        return string.replace(rex, '');
    };

    // Escapes certain characters to avoid 'invalid regular expression' errors when searching
    util.safeRegExp = function(pattern, flags) {
        var safePattern = pattern.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        return new RegExp(safePattern, flags);
    };

    // Serializes a form. Can optionally pass in an object holding any additional parameters you want to send with the form.
    util.serializeForm = function(form, additionalParams) {
        var serializedData = form.serialize();

        if (additionalParams) {
            serializedData += ('&' + $.param(additionalParams));
        }

        return serializedData;
    };

    // Use this instead of d3.event.offsetX to get the offset relative to a specific container (as opposed to
    // whatever the d3 event target is). Also, d3.event.offsetX doesn't work consistently over all browsers.
    util.d3XOffset = function(containerSelector) {
        return d3.event.pageX - $(d3.event.target).closest(containerSelector).offset().left;
    };
    util.d3YOffset = function(containerSelector) {
        return d3.event.pageY - $(d3.event.target).closest(containerSelector).offset().top;
    };

    util.removeD3Tips = function() {
        d3.selectAll('.d3-tip').remove();
    };

    // Updates a Foundation tooltip's title text (simply replacing the 'title' prop will not work during runtime)
    util.updateFoundationTooltip = function($tooltip, newText) {
        if (newText) {
            window.Foundation.libs.tooltip.getTip($tooltip).contents().first().replaceWith(newText);
        }
    };

    util.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    util.currentNavigationTabUrl = function() {
        return $('.top-bar-section').find('li.active a').attr('href');
    };

    util.logPerformance = function (key, start, end) {
        key = util.stringToFixedLength(key, 20);
        var time = util.stringToFixedLength((end - start).toFixed(2), 9, true);
        console.log(key + ' : ' + time + ' milliseconds');
    };

    util.stringToFixedLength = function(str, length, padLeft, padCharacter) {
        padCharacter = util.defaultFor(padCharacter, ' ');

        var padding = new Array(length).join(padCharacter);

        if (typeof str === 'undefined') {
            return padding;
        }

        if (padLeft) {
            return (padding + str).slice(-length);
        } else {
            return (str + padding).substring(0, length);
        }
    };

    util.setupAllNoneCheckbox = function($allNoneCb, $childCbs) {
        function updateAllNone(){
            var numChildrenChecked = $childCbs.filter(':checked').length;

            if(numChildrenChecked === 0) {
                $allNoneCb.prop('checked', false).prop('indeterminate', false);
            }
            else {
                $allNoneCb.prop('checked', true).prop('indeterminate', $childCbs.length !== numChildrenChecked);
            }
        }

        $allNoneCb.on('change', function(){
            $childCbs.prop('checked', $(this).prop('checked'));
        });

        $childCbs.on('change', function(){
            updateAllNone();
        });

        updateAllNone(); // Initial state
    };

    // From https://stackoverflow.com/a/11219680/4904996
    util.getOperatingSystem = function() {
        var OSName = "Unknown OS";

        if (navigator.appVersion.indexOf("Win") !== -1) {
            OSName = "Windows";
        }
        if (navigator.appVersion.indexOf("Mac") !== -1) {
            OSName = "MacOS";
        }
        if (navigator.appVersion.indexOf("X11") !== -1) {
            OSName = "UNIX";
        }
        if (navigator.appVersion.indexOf("Linux") !== -1) {
            OSName = "Linux";
        }

        return OSName;
    };

    // Prevents a kendo dropdownlist / combobox from closing when you scroll to an end
    // Taken from http://docs.telerik.com/kendo-ui/controls/editors/dropdownlist/how-to/appearance/prevent-close-on-scroll
    // Warning: If you apply this to one kendo list on the page, it must be applied to ALL lists on the page or they won't work
    //util.preventCloseOnScroll = function(kendoList) {
    //    var element = kendoList.ul.parent();
    //    var activeElement;
    //
    //    $(document).bind('mousewheel.kendoScrolling DOMMouseScroll.kendoScrolling', function(evt) {
    //        var scrollTo = null;
    //
    //        if (!$(activeElement).closest(".k-popup").length) {
    //            return;
    //        }
    //
    //        if (evt.type === 'mousewheel') {
    //            scrollTo = (evt.originalEvent.wheelDelta * -1);
    //        }
    //        else if (evt.type === 'DOMMouseScroll') {
    //            scrollTo = 40 * evt.originalEvent.detail;
    //        }
    //
    //        if (scrollTo) {
    //            evt.preventDefault();
    //            element.scrollTop(scrollTo + element.scrollTop());
    //        }
    //    });
    //
    //    $(document).on('mouseover.kendoScrolling', function(evt) {
    //        activeElement = evt.target;
    //    });
    //};

    // TODO HACKISH
    // Builds a kendo object and fixes its issues with scrolling. Prevents a list from closing on scroll or window.resize.
    $.fn.scrollableKendoObj = function(kendoType, params) {
        var onChange = params.change;
        delete params.change;
        var onClose = params.close;
        delete params.close;

        var kendoList;
        switch(kendoType) {
            case 'kendoDropDownList':
                kendoList = this.kendoDropDownList(params).data(kendoType);
                break;
            case 'kendoComboBox':
                kendoList = this.kendoComboBox(params).data(kendoType);
                break;
            default:
                return null;
        }

        var preventClosing = false;
        var timer;

        $(window).on('scroll.kendoScrolling', function() {
            // Stop kendo from closing (for a very brief time period)
            preventClosing = true;

            if (timer) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(function() {
                preventClosing = false;
            }, 100);
        });

        kendoList.bind('change', function(e) {
            if (onChange) {
                util.makeCallback(kendoList, onChange)(e);
            }

            // Always allow it to close when someone selects an item
            preventClosing = false;
            e.sender.close();
        });

        kendoList.bind('close', function(e) {
            if (preventClosing) {
                e.preventDefault();
                preventClosing = false;
            }
            else {
                // event is not prevented, so list will close
                if (onClose) {
                    util.makeCallback(kendoList, onClose)(e);
                }
            }
        });

        return kendoList;
    };

    // Need to clean up scroll event handlers since they were attached to the global document/window
    util.cleanupKendoScrolling = function() {
        //$(document).off('.kendoScrolling');
        $(window).off('.kendoScrolling');
    };


})(jQuery);
