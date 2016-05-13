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
    var fullLayout = this.fullLayout = opts.fullLayout;

    this.uid = this.fullLayout._uid + '-' + this.id;
    this.opts = this.fullLayout[this.id];
    this.userOpts = this.gd.layout[this.id] || {};

    // create div on instantiation for smoother first plot call
    this.div = this.createDiv();
    this.updateDiv(fullLayout);

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
    var self = this;
    var opts = self.opts;

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

    // TODO is that enough to keep layout and fullLayout in sync ???
    map.on('move', function(eventData) {
        map.getCenter();
        map.getZoom();
    });

};

proto.updateMap = function(fullData, fullLayout, resolve) {
    var self = this,
        map = self.map,
        opts = fullLayout[self.id];

    var currentStyle = self.getStyle(),
        style = opts.style;

    if(style !== currentStyle) {
        console.log('reload style')
        map.setStyle(convertStyleUrl(style));

        map.style.once('load', function() {
            console.log('on style reload')
            // ...
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
    var opts = fullLayout[this.id],
        map = this.map;

    map.setCenter(convertCenter(opts.center));
    map.setZoom(opts.zoom);

    this.updateDiv(fullLayout)
//     resize()
};

proto.createDiv = function() {
    var div = document.createElement('div');
    this.container.appendChild(div);

    div.id = this.uid;
    div.style.position = 'absolute';

    return div;
};

proto.updateDiv = function(fullLayout) {
    var div = this.div;

    var domain = fullLayout[this.id].domain,
        size = fullLayout._size,
        style = div.style;

    style.left = size.l + domain.x[0] * size.w + 'px';
    style.top = size.t + (1 - domain.y[1]) * size.h + 'px';
    style.width = size.w * (domain.x[1] - domain.x[0]) + 'px';
    style.height = size.h * (domain.y[1] - domain.y[0]) + 'px';

//     style.top = 0;
//     style.bottom = 0;
//     style.width = '100%';
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
