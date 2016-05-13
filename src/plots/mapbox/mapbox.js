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
var xmlnsNamespaces = require('../../constants/xmlns_namespaces');


function Mapbox(opts) {
    this.id = opts.id;
    this.gd = opts.gd;
    this.container = opts.container;

    var fullLayout = opts.fullLayout;
    this.uid = fullLayout._uid + '-' + this.id;
    this.opts = fullLayout[this.id];

    // create div on instantiation for a smoother first plot call
    this.div = null;
    this.hoverLayer = null;
    this.createFramework(fullLayout);

    this.map = null;
    this.traceHash = {};
}

var proto = Mapbox.prototype;

module.exports = function createMapbox(opts) {
    var mapbox = new Mapbox(opts);

    return mapbox;
};

proto.plot = function(fullData, fullLayout, promises) {
    var self = this;

    // feed in new mapbox options
    self.opts = fullLayout[this.id];

    var promise;
    // might want to use map.loaded() ???

    // how to get streaming to work ???

    if(!self.map) {
        promise = new Promise(function(resolve) {
            self.createMap(fullData, fullLayout, resolve);
        });
    }
    else {
        promise = new Promise(function(resolve) {
            self.updateMap(fullData, fullLayout, resolve);
        });
    }

    promises.push(promise);
};

proto.createMap = function(fullData, fullLayout, resolve) {
    var self = this,
        opts = this.opts;

    var map = self.map = new mapboxgl.Map({
        container: self.uid,
        style: convertStyleUrl(opts.style),
        center: convertCenter(opts.center),
        zoom: opts.zoom
    });

    map.once('load', function() {
        console.log('map on load')
        self.updateData(fullData);
        self.updateLayout(fullLayout);
        resolve();
    });

    map.on('mousemove', function(eventData) {
        // hover code goes here !!!
    });

    // keep track of pan / zoom in user layout
    map.on('move', function() {
        var center = map.getCenter();
        opts._input.center = opts.center = { lon: center.lng, lat: center.lat };
        opts._input.zoom = opts.zoom = map.getZoom();
    });

};

proto.updateMap = function(fullData, fullLayout, resolve) {
    var self = this,
        map = self.map;

    var currentStyle = self.getStyle(),
        style = self.opts.style;

    if(style !== currentStyle) {
        console.log('reload style')
        map.setStyle(convertStyleUrl(style));

        map.style.once('load', function() {
            console.log('on style reload')

            // need to rebuild trace layers on reload
            // to avoid 'lost event' errors
            self.traceHash = {};

            self.updateData(fullData);
            self.updateLayout(fullLayout);
            resolve();
        });
    }
    else {
        console.log('not reload style')
        self.updateData(fullData);
        self.updateLayout(fullLayout);
        resolve();
    }
};

proto.updateData = function(fullData) {
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
};

proto.updateLayout = function(fullLayout) {
    var map = this.map,
        opts = this.opts;

    map.setCenter(convertCenter(opts.center));
    map.setZoom(opts.zoom);


    this.updateFramework(fullLayout)
    this.map.resize();
};

proto.createFramework = function(fullLayout) {
    var div = this.div = document.createElement('div');

    div.id = this.uid;
    div.style.position = 'absolute';

    var hoverLayer = this.hoverLayer = document.createElementNS(
        xmlnsNamespaces.svg, 'svg'
    );

    var hoverStyle = hoverLayer.style;

    hoverStyle.position = 'absolute';
    hoverStyle.top = hoverStyle.left = '0px';
    hoverStyle.width = hoverStyle.height = '100%';
    hoverStyle['z-index'] = 20;
    hoverStyle['pointer-events'] = 'none';

    this.container.appendChild(div);
    this.container.appendChild(hoverLayer);

    this.updateFramework(fullLayout);
};

proto.updateFramework = function(fullLayout) {
    var domain = fullLayout[this.id].domain,
        size = fullLayout._size;

    var style = this.div.style;

    // Is this correct? It seems to get the map zoom level wrong?

    style.width = size.w * (domain.x[1] - domain.x[0]) + 'px';
    style.height = size.h * (domain.y[1] - domain.y[0]) + 'px';
    style.left = size.l + domain.x[0] * size.w + 'px';
    style.top = size.t + (1 - domain.y[1]) * size.h + 'px';
};

proto.destroy = function() {
    this.map.remove();
    this.container.removerChild(this.div);
};

proto.getStyle = function() {
    var name = this.map.getStyle().name;

    return name.split(' ')[1].toLowerCase();
};

function convertStyleUrl(style) {
    return constants.styleUrlPrefix + style + '-' + constants.styleUrlSuffix;
}

function convertCenter(center) {
    return [center.lon, center.lat];
}
