/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var mapboxgl = require('mapbox-gl');

var convert = require('./convert');


function ScatterMapbox(mapbox, uid) {
    this.mapbox = mapbox;
    this.map = mapbox.map;

    this.uid = uid;
    this.idSourceMarkers = uid + '-source-markers';
    this.idSourceLines = uid + '-source-lines';
    this.idLayerMarkers = uid + '-layer-markers';
    this.idLayerLines = uid + '-layer-lines';

    this.sourceLines = new mapboxgl.GeoJSONSource({});
    this.map.addSource(this.idSourceLines, this.sourceLines);
    this.map.addLayer({
        id: this.idLayerLines,
        source: this.idSourceLines,
        type: 'line',
        interactive: true
    });

    this.sourceMarkers = new mapboxgl.GeoJSONSource();
    this.map.addSource(this.idSourceMarkers, this.sourceMarkers);
    this.map.addLayer({
        id: this.idLayerMarkers,
        source: this.idSourceMarkers,
        type: 'circle',
        interactive: true
    });

    // how to add 'symbol' layer ???
}

var proto = ScatterMapbox.prototype;

proto.update = function update(trace) {
    var opts = convert(trace);

    console.log('scatter update');

    this.sourceLines.setData(opts.geojsonLines);
    setOptions(this.map, this.idLayerLines, 'setLayoutProperty', opts.layoutLines);
    setOptions(this.map, this.idLayerLines, 'setPaintProperty', opts.paintLines);

    this.sourceMarkers.setData(opts.geojsonMarkers);
    setOptions(this.map, this.idLayerMarkers, 'setLayoutProperty', opts.layoutMarkers);
    setOptions(this.map, this.idLayerMarkers, 'setPaintProperty', opts.paintMarkers);
};

proto.dispose = function dispose() {
    this.removeLayer(this.idLayerMarkers);
    this.removeSource(this.idSourceMarkers);

    this.removeLayer(this.idLayerLines);
    this.removeSource(this.idSourceLines);
};

function setOptions(map, id, methodName, opts) {
    var keys = Object.keys(opts);

    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];

        map[methodName](id, key, opts[key]);
    }
}

module.exports = function createScatterMapbox(mapbox, trace) {
    console.log('scatter create');

    var scatterMapbox = new ScatterMapbox(mapbox, trace.uid);
    scatterMapbox.update(trace);

    return scatterMapbox;
};
