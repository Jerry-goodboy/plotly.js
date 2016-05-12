/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var mapboxgl = require('mapbox-gl');

var Plots = require('../plots');
var createMapbox = require('./mapbox');
var CREDS = require('../../../creds.json');


exports.name = 'mapbox';

exports.attr = 'subplot';

exports.idRoot = 'mapbox';

exports.idRegex = /^mapbox([2-9]|[1-9][0-9]+)?$/;

exports.attrRegex = /^mapbox([2-9]|[1-9][0-9]+)?$/;

exports.attributes = {
    subplot: {
        valType: 'subplotid',
        role: 'info',
        dflt: 'mapbox',
        description: [
            'Sets a reference between this trace\'s data coordinates and',
            'a mapbox subplot.',
            'If *mapbox* (the default value), the data refer to `layout.mapbox`.',
            'If *mapbox2*, the data refer to `layout.mapbox2`, and so on.'
        ].join(' ')
    }
};

exports.layoutAttributes = require('./layout_attributes');

exports.supplyLayoutDefaults = require('./layout_defaults');

exports.plot = function plotMapbox(gd) {

    // TODO maybe this should be a config argument?
    mapboxgl.accessToken = CREDS.accessToken;

    var fullLayout = gd._fullLayout,
        fullData = gd._fullData,
        mapboxIds = Plots.getSubplotIds(fullLayout, 'mapbox');

    for(var i = 0; i < mapboxIds.length; i++) {
        var id = mapboxIds[i],
            fullMapboxData = Plots.getSubplotData(fullData, 'mapbox', id),
            mapbox = fullLayout[id]._mapbox;

        if(!mapbox) {
            mapbox = createMapbox({
                gd: gd,
                container: fullLayout._glcontainer.node(),
                id: id,
                fullLayout: fullLayout
            });

            fullLayout[id]._mapbox = mapbox;
        }

        mapbox.plot(fullMapboxData, fullLayout, gd._promises);
    }
};

exports.clean = function() {};
