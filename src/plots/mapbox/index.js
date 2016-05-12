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
var handleSubplotDefaults = require('../subplot_defaults');

var createMapbox = require('./mapbox');

// TODO maybe this should be a config argument?
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

exports.layoutAttributes = {
    domain: {
        x: {
            valType: 'info_array',
            role: 'info',
            items: [
                {valType: 'number', min: 0, max: 1},
                {valType: 'number', min: 0, max: 1}
            ],
            dflt: [0, 1],
            description: [
                'Sets the horizontal domain of this subplot',
                '(in plot fraction).'
            ].join(' ')
        },
        y: {
            valType: 'info_array',
            role: 'info',
            items: [
                {valType: 'number', min: 0, max: 1},
                {valType: 'number', min: 0, max: 1}
            ],
            dflt: [0, 1],
            description: [
                'Sets the vertical domain of this subplot',
                '(in plot fraction).'
            ].join(' ')
        }
    },

    style: {
        valType: 'enumerated',
        values: ['light-v8', 'dark-v8'],
        dflt: 'streets-v8'
    },
    center: {
        lon: {
            valType: 'number',
            dflt: 0
        },
        lat: {
            valType: 'number',
            dflt: 0
        }
    },
    zoom: {
        valType: 'number',
        dflt: 1
    },

    // custom geojson or topojson layers
    layers: {

    }
};

exports.supplyLayoutDefaults = function(layoutIn, layoutOut, fullData) {
    handleSubplotDefaults(layoutIn, layoutOut, fullData, {
        type: 'mapbox',
        attributes: exports.layoutAttributes,
        handleDefaults: handleDefaults,
        partition: 'y'
    });
};

function handleDefaults(containerIn, containerOut, coerce) {
    coerce('style');
    coerce('center.lon');
    coerce('center.lat');
    coerce('zoom');
}

exports.plot = function plotMapbox(gd) {
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
