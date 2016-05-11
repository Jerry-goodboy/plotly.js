/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var isNumeric = require('fast-isnumeric');


exports.moduleType = 'trace';

exports.name = 'scattermapbox';

exports.categories = ['mapbox', 'gl'];

exports.meta = {
    description: [
        '(beta)'
    ].join(' ')
};

exports.basePlotModule = require('../../plots/mapbox');

exports.attributes = require('../scattergeo/attributes');

exports.supplyDefaults = require('../scattergeo/defaults');

exports.plot = function(mapbox, trace) {
    var map = mapbox.map;

    var opts = convert(trace);

    map.addSource(trace.uid, {
        type: 'geojson',
        data: opts.geojson
    });

    map.addLayer({
        id: trace.uid + '-markers',
        source: trace.uid,

        type: 'circle',  // 'background', 'fill', 'line', 'symbol', 'raster', 'circle'

        // circle properties: https://www.mapbox.com/mapbox-gl-style-spec/#layers-circle
        layout: opts.layout,

        // circle properties: https://www.mapbox.com/mapbox-gl-style-spec/#layers-circle
        paint: opts.paint
    });
};

function convert(trace) {
    var len = trace.lon.length;
    var coordinates = [];

    for(var i = 0; i < len; i++) {
        var lon = trace.lon[i],
            lat = trace.lat[i];

        if(isNumeric(lon) && isNumeric(lat)) {
            coordinates.push([+lon, +lat]);
        }
    }

    var geojson = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: trace.mode === 'markers' ? 'MultiPoint' : 'LineString',
                coordinates: coordinates
            }
        }]
    };

    var layout = {
        visibility: (trace.visible === true) ? 'visible' : 'none'
    };

    var marker = trace.marker || {};

    var paint = {
        'circle-radius': marker.size / 2,
        'circle-color': marker.color,
        'circle-opacity': marker.opacity
    };

    return {
        geojson: geojson,
        layout: layout,
        paint: paint
    };
}
