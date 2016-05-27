/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var scatterGeoAttrs = require('../scattergeo/attributes');
var plotAttrs = require('../../plots/attributes');
var extendFlat = require('../../lib/extend').extendFlat;

var lineAttrs = scatterGeoAttrs.line;
var markerAttrs = scatterGeoAttrs.marker;


module.exports = {
    lon: scatterGeoAttrs.lon,
    lat: scatterGeoAttrs.lat,

    // locations
    // locationmode

    mode: {
        valType: 'flaglist',
        flags: ['lines', 'markers'],
        dflt: 'markers',
        extras: ['none'],
        role: 'info',
        description: [
            'Determines the drawing mode for this scatter trace.'
        ].join(' ')
    },

    // text

    line: {
        color: lineAttrs.color,
        width: lineAttrs.width,
        dash: lineAttrs.dash  // TODO
    },

    //connectgaps

    marker: {
        symbol: {
            valType: 'enumerated',
            values: ['circle'],  // TODO
            dflt: 'circle',
            role: 'style',
            description: [
                ''
            ].join(' ')
        },
        opacity: extendFlat({}, markerAttrs.opacity, {
            arrayOk: false
        }),
        size: markerAttrs.size,
        sizeref: markerAttrs.sizeref,
        sizemin: markerAttrs.sizemin,
        sizemode: markerAttrs.sizemode,
        color: markerAttrs.color,
        colorscale: markerAttrs.colorscale,
        cauto: markerAttrs.cauto,
        cmax: markerAttrs.cmax,
        cmin: markerAttrs.cmin,
        autocolorscale: markerAttrs.autocolorscale,
        reversescale: markerAttrs.reversescale,
        showscale: markerAttrs.showscale

        // line
    },

    hoverinfo: extendFlat({}, plotAttrs.hoverinfo, {
        flags: ['lon', 'lat', 'text', 'name']
    }),

    _nestedModules: {
        'marker.colorbar': 'Colorbar'
    }
};
