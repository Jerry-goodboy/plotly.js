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


module.exports = function convert(trace) {
    var isVisible = (trace.visible === true),
        hasLines = subTypes.hasLines(trace),
        hasMarkers = subTypes.hasMarkers(trace);

    var coordinates = (isVisible) ? calcCoords(trace) : [];

    var geojsonLines = makeGeoJson('LineString', coordinates);
    var layoutLines = {
        visibility: (isVisible && hasLines) ? 'visible' : 'none'
    };
    var paintLines = {};

    if(hasLines) {
        var line = trace.line;

        Lib.extendFlat(paintLines, {
            'line-width': line.width,
            'line-color': line.color,
            'line-opacity': trace.opacity
        });

        // could probably convert line.dash into
        // line-dasharray and line-pattern
    }

    var geojsonMarkers = makeGeoJson('MultiPoint', coordinates);
    var layoutMarkers = {
        visibility: (isVisible && hasMarkers) ? 'visible' : 'none'
    };
    var paintMarkers = {};

    if(hasMarkers) {
        var marker = trace.marker;

        Lib.extendFlat(paintMarkers, {
            'circle-radius': marker.size / 2,
            'circle-color': marker.color,
            'circle-opacity': trace.opacity * marker.opacity
        });

        // could probably translate arrayOk properties into
        // multiple layers by making paintMarkers a array!
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

function makeGeoJson(geometryType, coordinates) {
    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: geometryType,
                coordinates: coordinates
            }
        }]
    };
}
