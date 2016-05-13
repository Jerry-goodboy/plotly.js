/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var handleSubplotDefaults = require('../subplot_defaults');
var layoutAttributes = require('./layout_attributes');


module.exports = function supplyLayoutDefaults(layoutIn, layoutOut, fullData) {
    handleSubplotDefaults(layoutIn, layoutOut, fullData, {
        type: 'mapbox',
        attributes: layoutAttributes,
        handleDefaults: handleDefaults,
        partition: 'y'
    });
};

function handleDefaults(containerIn, containerOut, coerce) {
    coerce('style');
    coerce('center.lon');
    coerce('center.lat');
    coerce('zoom');

    containerOut._input = containerIn;
}
