analysjs
========

A library to make Segment.io analytics tracking **even easier**
through a jQuery plugin and element's data attributes.

Check Segment.io page for details:
 
 - https://segment.io
 - https://segment.io/libraries/analytics.js

Install/Load
------------

You must call `analysjs.load(apiToken, identify)` in order to install the segment.io lib.

**Note:** Set `null` on `apiToken` in order to disable metric tracking.


Element metric binding
----------------------

Through `data-metric-*` attributes it's possible to trigger metrics with zero JavaScript.

The `data-metric` attribute will be the event name.
The other `data-metric-*` attributes will be passed to the event as its properties, for example:

```html
<button type="button"
    data-metric="Signup"
    data-metric-cupom-code="A9XJL31"
    data-metric-revenue="9.90">Sign Up</button>
```

The metric name will be **Signup** and two properties will be sended, `cupomCode` and `revenue`.

### The auto-bind behaviour
When the plugin is loaded it looks for all elements that has a valid `data-metric` attribute (which will be used as the name of the event) and register specific events/behavior for each case:

#### 1 - When the element is an `<a>`
The library calls `analytics.trackLink` with the properties found on the element.
```html
<a href="/signup"
    data-metric="Signup intention"
    data-metric-plan="free">Signup</a>
```
Check the original documentation https://segment.io/libraries/analytics.js#trackLink

#### 2 - When the element is an `<form>`
The library calls `analytics.trackForm` with the properties found on the element.
```html
<form action="/signup" method="POST"
    data-metric="Signup">Signup</a>
```
Check the original documentation https://segment.io/libraries/analytics.js#trackForm

#### 3 - When the element is an `<button>`
A click event will be binded and when triggered will call `analytics.track` with the properties found on the element.
```html
<button data-metric="Signin">Sign In</button>
```

#### 4 - Any other element
 - It will look for a `data-metric-page-view`, if found and `true` a page view event will be tracked, through `analytics.page`. Also a `data-metric-page-category` can be specified.
 ```html
 <div data-metric="Home page"
     data-metric-page-view="true"
     data-metric-page-category="landing">
     ...
 </div>
 ```
Check the original documentation https://segment.io/libraries/analytics.js#page

 - It will look for a `data-metric-event`, if found the named event will be binded and `analytics.track` will be called when the event is triggered.
 ```html
 <input type="text" name="address"
     data-metric="Check address"
     data-metric-event="blur">
 ```

 - Otherwise it will be ignored by auto-bind, being useful only if you call the `triggerMetric` plugin. Check below.


### The `$(el).triggerMetric()` method
An useful method to trigger metric manually, using the properties defined on the element itself.

```html
<div id="success-notification"
    data-metric="Completed survey"
    data-metric-survey-type="satisfaction">
    ...
</div>
```
```js
function onSuccess() {
    $('#success-notification').triggerMetric({
        elapsedTime : 0 // time spent on survey
    });
}
```

License
-------

MIT 2.0
