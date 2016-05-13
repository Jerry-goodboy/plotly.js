/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';


var ScatterMapbox = {};

// For first version:
//  - Different symbols
//  - Different line dashes
//  - no `locations` support
//  - no 'text' mode support
//  - arrayOk properties would require multi layers per source
//  - support for marker.line ???
ScatterMapbox.attributes = require('../scattergeo/attributes');
ScatterMapbox.supplyDefaults = require('../scattergeo/defaults');
ScatterMapbox.colorbar = require('../scatter/colorbar');
ScatterMapbox.calc = require('../scattergeo/calc');
ScatterMapbox.plot = require('./plot');

ScatterMapbox.moduleType = 'trace';
ScatterMapbox.name = 'scattermapbox';
ScatterMapbox.basePlotModule = require('../../plots/mapbox');
ScatterMapbox.categories = ['mapbox', 'gl', 'symbols', 'showLegend'];
// ScatterMapbox.categories = ['mapbox', 'gl', 'symbols', 'markerColorscale', 'showLegend'];
ScatterMapbox.meta = {
    hrName: 'scatter_mapbox',
    description: [
        'The data visualized as scatter point or lines',
        'on a Mapbox GL geographic map',
        'is provided by longitude/latitude pairs in `lon` and `lat`.'
    ].join(' ')
};

module.exports = ScatterMapbox;
