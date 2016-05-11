/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var mapboxgl = require('mapbox-gl');

function Mapbox(opts) {
    this.id = opts.id;
    this.gd = opts.gd;
    this.container = opts.container;
    this.fullLayout = opts.fullLayout;

    this.opts = this.fullLayout[this.id];
    this.div = this.createDiv();

    this.map = null;
    this.traceHash = {};
}

var proto = Mapbox.prototype;

module.exports = function createMapbox(opts) {
    return new Mapbox(opts);
};

proto.createDiv = function() {
    var div = document.createElement('div');

    div.id = this.id;
    this.container.appendChild(div);

    var style = div.style;
    style.position = 'absolute';
    style.top = 0;
    style.bottom = 0;
    style.width = '100%';

    return div;
};

proto.plot = function(fullData, fullLayout, promises) {
    var self = this;

    var promise = new Promise(function(resolve) {

        self.map = new mapboxgl.Map({

            // container id
            container: self.id,

            // stylesheet location
            style: 'mapbox://styles/mapbox/' + self.opts.style,

            // starting position
            center: [self.opts.center.lon, self.opts.center.lat],

            // starting zoom
            zoom: self.opts.zoom
        });

        self.map.on('load', function() {

            for(var i = 0; i < fullData.length; i++) {
                var trace = fullData[i];

                trace._module.plot(self, trace);
            }

            resolve(self.map);
        });
    });

    promises.push(promise);
};
