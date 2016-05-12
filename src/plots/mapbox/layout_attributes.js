/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';


module.exports = {
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
        values: ['streets', 'outdoors', 'light', 'dark', 'satellite', 'satellite-streets'],
        dflt: 'streets',
        description: [
            ''
        ].join(' ')
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
