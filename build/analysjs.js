/* jshint ignore:start */

// Create a queue, but don't obliterate an existing one!
window.analytics = window.analytics || [];

// A list of the methods in Analytics.js to stub.
window.analytics.methods = ['identify', 'group', 'track',
    'page', 'pageview', 'alias', 'ready', 'on', 'once', 'off',
    'trackLink', 'trackForm', 'trackClick', 'trackSubmit'];

// Define a factory to create stubs. These are placeholders
// for methods in Analytics.js so that you never have to wait
// for it to load to actually record data. The `method` is
// stored as the first argument, so we can replay the data.
window.analytics.factory = function(method){
    return function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        window.analytics.push(args);
        return window.analytics;
    };
};

// For each of our methods, generate a queueing stub.
for (var i = 0; i < window.analytics.methods.length; i++) {
    var key = window.analytics.methods[i];
    window.analytics[key] = window.analytics.factory(key);
}

// Define a method to load Analytics.js from our CDN,
// and that will be sure to only ever load it once.
window.analytics.load = function(key){
    if (document.getElementById('analytics-js')) return;

    // Create an async script element based on your key.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'analytics-js';
    script.async = true;
    script.src = ('https:' === document.location.protocol
        ? 'https://' : 'http://')
        + 'cdn.segment.io/analytics.js/v1/'
        + key + '/analytics.min.js';

    // Insert our script next to the first script element.
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(script, first);
};

// Add a version to keep track of what's in the wild.
window.analytics.SNIPPET_VERSION = '2.0.9';

/* jshint ignore:end */
(function(global, $) {

    /**
     * @class Analysjs
     * @singleton
     * @constructor
     */
    var Analysjs = function() {
        if (!analytics) {
            throw new Error('The "analytics" object could not be found. ' +
                'Check if the segment.io library was installed correctly.');
        }
    };

    /**
     * Load the analytics library. If the key is not defined
     * then all analytics methods will be empty, just a stub.
     *
     * @param key
     * @param identify
     */
    Analysjs.prototype.load = function(key, profile, shouldAlias, callback) {
        if (key && key.length) {
            analytics.load(key);
            analytics.ready(function(){
                profile = profile || {};

                var user = analytics.user();
                if (!user || !user.id()) {
                    var distinct_id = profile.distinct_id || profile.id;
                    if (distinct_id) {
                        if (shouldAlias) {
                            analytics.alias(distinct_id);
                        }
                        analytics.identify(distinct_id, profile);
                    } else {
                        analytics.identify(profile);
                    }
                }
                if (callback) {
                    $(function() {
                        callback();
                    });
                }
            });
        } else {
            var emptyMethod = function() {};
            var methods = analytics.methods;
            for (var i in methods) {
                var name = methods[i];
                analytics[name] = emptyMethod;
            }
        }
    };

    /**
     * @param $el
     * @returns {Object}
     * @private
     */
    Analysjs.prototype._getProperties = function($el) {
        var properties = {};
        var data = $el.data();
        for (var name in data) {
            if (name !== 'metric' && name.indexOf('metric') === 0) {
                properties[this._convertPropertyName(name)] = this._convertProperty(data[name]);
            }
        }
        return properties;
    };

    /**
     * @param name
     * @returns {string}
     * @private
     */
    Analysjs.prototype._convertPropertyName = function(name) {
        var length = 'metric'.length;
        return name.charAt(length).toLowerCase() + name.slice(length + 1);
    };

    /**
     *
     * @param value
     * @returns {string|number|boolean}
     * @private
     */
    Analysjs.prototype._convertProperty = function(value) {
        var converted = value;
        if (value) {
            if (value === 'true') {
                converted = true;
            } else  if (value === 'false') {
                converted = false;
            } else {
                var number = parseFloat(value);
                if (!isNaN(number)) {
                    converted = number;
                }
            }
        }
        return converted;
    };

    /**
     * Trigger a metric event (analytics.track) base on
     * element's data-metric-* attributes.
     * @param $el jQuery element reference.
     */
    Analysjs.prototype.triggerMetric = function($el) {
        var properties = this._getProperties($el);
        analytics.track(metricName, properties);
    };

    /**
     * Bind a metric event based on element's type and
     * data-metric-* attributes.
     *  - For <form> it calls a `analytics.trackForm`
     *  - For <a> it calls a `analytics.trackLink`
     *  - For <button> calls a `analytics.track` on a `click` event
     *  - For other elements it checks for `data-metric-page-view == true`
     *  and then calls `analytics.page` or looks for a `data-metric-event`
     *  for a custom event binding, otherwise it is ignored.
     * @param $el
     */
    Analysjs.prototype.bindMetric = function($el) {
        var tag = $el.get(0).tagName.toLowerCase();
        var metricName = $el.data('metric');
        var properties = this._getProperties($el);
        switch (tag) {
            case 'a':
                analytics.trackLink($el, metricName, properties);
                break;
            case 'form':
                analytics.trackForm($el, metricName, properties);
                break;
            case 'button':
                $el.click(function() {
                    analytics.track(metricName, properties);
                });
                break;
            default:
                if (properties.pageView === true) {
                    analytics.page(metricName, properties.pageCategory, properties);
                } else {
                    var event = properties.event;
                    if (event) {
                        $el.on(event, function(e) {
                            properties.eventType = e.type;
                            analytics.track(metricName, properties);
                        });
                    }
                }
        }
    };

    global.analysjs = new Analysjs();

})(this, this.jQuery || this.ender);
(function(global, $) {

    /**
     *
     * @param properties
     */
    $.fn.triggerMetric = function(properties) {
        return $(this).each(function() {
            var $this = $(this);
            var metric = $this.data('metric');
            if (metric) {
                properties = $.extend(getProperties($this), properties);
                global.analysjs.triggerMetric(metric, properties);
            } else {
                throw new Error('This element does not support metric triggering. ' +
                    'You must provide a valid data-metric attribute.');
            }
        });
    };

    $(function() {

        $('[data-metric]').each(function() {
            var $this = $(this);
            var metric = $this.data('metric');
            if (metric) {
                global.analysjs.bindMetric($this);
            }
        });

    });

})(this, this.jQuery || this.ender);