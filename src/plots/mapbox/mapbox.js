/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var mapboxgl = require('mapbox-gl');

var constants = require('./constants');


function Mapbox(opts) {
    this.id = opts.id;
    this.gd = opts.gd;
    this.container = opts.container;
    this.fullLayout = opts.fullLayout;

    this.uid = this.fullLayout._uid + '-' + this.id;
    this.opts = this.fullLayout[this.id];
    this.userOpts = this.gd.layout[this.id] || {};

    this.div = null;
    this.map = null;
    this.traceHash = {};

    this.createDiv();
}

var proto = Mapbox.prototype;

module.exports = function createMapbox(opts) {
    var mapbox = new Mapbox(opts);

    return mapbox;
};

proto.plot = function(fullData, fullLayout, promises) {
    var self = this;
    var promise;

    // might want to use map.loaded() ???

    if(!self.map) {
        promise = new Promise(function(resolve) {
            self.createMap(fullData, fullLayout, resolve);
        });
    }
    else {
        promise = new Promise(function(resolve) {
            self.updateMap(fullData, fullLayout);
            resolve();
        });
    }

    promises.push(promise);
};

proto.createMap = function(fullData, fullLayout, resolve) {
    var self = this;
    var opts = self.opts;

    var map = self.map = new mapboxgl.Map({
        container: self.uid,
        style: convertStyleUrl(opts.style),
        center: convertCenter(opts.center),
        zoom: opts.zoom
    });

    map.on('load', function() {
        console.log('map on load')
        self.updateMap(fullData, fullLayout);
        resolve();
    });

    map.on('load', function() {
        console.log('map on load.style')
    });

    map.on('mousemove', function(eventData) {
        // hover code goes here !!!
    });

    // TODO is that enough to keep layout and fullLayout in sync ???
    map.on('move', function(eventData) {
        map.getCenter();
        map.getZoom();
    });

};

// is this async in general ???
proto.updateMap = function(fullData, fullLayout) {
    var traceHash = this.traceHash;
    var traceObj, i, j;

    // update or create trace objects
    for(i = 0; i < fullData.length; i++) {
        var trace = fullData[i];
        traceObj = traceHash[trace.uid];

        if(traceObj) traceObj.update(trace);
        else {
            traceHash[trace.uid] = trace._module.plot(this, trace);
        }
    }

    // remove empty trace objects
    var ids = Object.keys(traceHash);
    id_loop:
    for(i = 0; i < ids.length; i++) {
        var id = ids[i];

        for(j = 0; j < fullData.length; j++) {
            if(id === fullData[j].uid) continue id_loop;
        }

        traceObj = traceHash[id];
        traceObj.dispose();
        delete traceHash[id];
    }

    var map = this.map,
        opts = fullLayout[this.id];

    var styleUrl = map.getStyle().sprite,
        style = opts.style;

    if(styleUrl !== convertStyleUrl(style)) {
        console.log('reload style')
        var styleObject = map.getStyle(convertStyleUrl(style));

        map.setStyle(styleObject);
    }

    map.setCenter(convertCenter(opts.center));
    map.setZoom(opts.zoom);
};

proto.createDiv = function() {
    var div = this.div = document.createElement('div');

    div.id = this.uid;
    this.container.appendChild(div);

    this.updateDiv();
};

proto.updateDiv = function(fullLayout) {
    var div = this.div;

    // TODO update dims based on _size

    var style = div.style;
    style.position = 'absolute';
    style.top = 0;
    style.bottom = 0;
    style.width = '100%';
};

proto.destroy = function() {
    this.map.remove();
    this.container.removerChild(this.div);
};

function convertStyleUrl(style) {
    return constants.styleUrlPrefix + style + '-' + constants.styleUrlSuffix;
};

function convertCenter(center) {
    return [center.lon, center.lat];
};
