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