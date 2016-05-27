/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var isNumeric = require('fast-isnumeric');

var Lib = require('../../lib');
var subTypes = require('../scatter/subtypes');
var makeBubbleSizeFn = require('../scatter/make_bubble_size_func');
var hasColorscale = require('../../components/colorscale/has_colorscale');
var makeColorScaleFn = require('../../components/colorscale/make_scale_function');

var COLOR_PROP = 'circle-color';
var SIZE_PROP = 'circle-size';


module.exports = function convert(trace) {
    var isVisible = (trace.visible === true),
        hasLines = subTypes.hasLines(trace),
        hasMarkers = subTypes.hasMarkers(trace);

    var geojsonLines = makeBlankGeoJSON(),
        layoutLines = { visibility: 'none' },
        paintLines = {};

    var geojsonMarkers = makeBlankGeoJSON(),
        layoutMarkers = { visibility: 'none' },
        paintMarkers = {};

    if(isVisible && hasLines) {
        geojsonLines = makeLineGeoJSON(trace);
        layoutLines.visibility = 'visible';

        var line = trace.line;

        Lib.extendFlat(paintLines, {
            'line-width': line.width,
            'line-color': line.color,
            'line-opacity': trace.opacity
        });

        // could probably convert line.dash into
        // line-dasharray and line-pattern
    }

    if(isVisible && hasMarkers) {
        var hash = {};
        hash[COLOR_PROP] = {};
        hash[SIZE_PROP] = {};

        geojsonMarkers = makeMarkerGeoJSON(trace, hash);
        layoutMarkers.visibility = 'visible';

        Lib.extendFlat(paintMarkers, {
            'circle-opacity': trace.opacity * trace.marker.opacity,
            'circle-color': calcMarkerColor(trace, hash),
            'circle-radius': calcMarkerSize(trace, hash)
        });
    }

    return {
        geojsonLines: geojsonLines,
        layoutLines: layoutLines,
        paintLines: paintLines,

        geojsonMarkers: geojsonMarkers,
        layoutMarkers: layoutMarkers,
        paintMarkers: paintMarkers
    };
};

function makeBlankGeoJSON() {
    return {
        type: 'Point',
        coordinates: []
    };
}

function makeLineGeoJSON(trace) {
    return {
        type: 'MultiLineString',
        coordinates: [calcCoords(trace)]
    };
}

// N.B. `hash` is mutated here
function makeMarkerGeoJSON(trace, hash) {
    var marker = trace.marker,
        len = trace.lon.length,
        hasColorArray = Array.isArray(marker.color),
        hasSizeArray = Array.isArray(marker.size);

    // translate vals in trace arrayOk containers
    // into a val-to-index hash object
    function translate(props, key, cont, index) {
        var value = cont[index];

        if(!hash[key][value]) hash[key][value] = index;

        props[key] = hash[key][value];
    }

    var features = [];

    for(var i = 0; i < len; i++) {
        var lon = trace.lon[i],
            lat = trace.lat[i];

        var props = {};
        if(hasColorArray) translate(props, COLOR_PROP, marker.color, i);
        if(hasSizeArray) translate(props, SIZE_PROP, marker.size, i);

        if(isNumeric(lon) && isNumeric(lat)) {
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [+lon, +lat]
                },
                properties: props
            });
        }
    }

    return {
        type: 'FeatureCollection',
        features: features
    };
}

function calcMarkerColor(trace, hash) {
    var marker = trace.marker;
    var out;

    if(Array.isArray(marker.color)) {
        var colorFn = hasColorscale(trace, 'marker') ?
                makeColorScaleFn(marker.colorscale, marker.cmin, marker.cmax) :
                Lib.identity;

        var vals = Object.keys(hash[COLOR_PROP]),
            stops = [];

        for(var i = 0; i < vals.length; i++) {
            var val = vals[i];

            stops.push([ hash[COLOR_PROP][val], colorFn(val) ]);
        }

        out = {
            property: SIZE_PROP,
            stops: stops
        };

    }
    else {
        out = marker.color;
    }

    return out;
}

function calcMarkerSize(trace, hash) {
    var marker = trace.marker;
    var out;

    if(Array.isArray(marker.size)) {
        var sizeFn = makeBubbleSizeFn(trace);

        var vals = Object.keys(hash[SIZE_PROP]),
            stops = [];

        for(var i = 0; i < vals.length; i++) {
            var val = vals[i];

            stops.push([ hash[SIZE_PROP][val], sizeFn(val) ]);
        }

        // stops indices must be sorted
        stops.sort(function(a, b) {
            return a[0] - b[0];
        });

        out = {
            property: SIZE_PROP,
            stops: stops
        };
    }
    else {
        out = marker.size / 2;
    }

    return out;
}


function calcCoords(trace) {
    var len = trace.lon.length;
    var coordinates = [];

    for(var i = 0; i < len; i++) {
        var lon = trace.lon[i],
            lat = trace.lat[i];

        if(isNumeric(lon) && isNumeric(lat)) {
            coordinates.push([+lon, +lat]);
        }
    }

    return coordinates;
}
