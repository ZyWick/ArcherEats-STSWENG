import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj.js';

window.onload = init;

function init(){
    const washingtonWebMercator = fromLonLat([-77.036667, 38.895]);
    
    const map = new Map({
    view: new View({
        center: washingtonWebMercator,
        zoom: 8
        }),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      target: 'js-map',
    })
}