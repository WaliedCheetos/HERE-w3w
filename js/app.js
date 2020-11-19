import { HEREInitials, What3WordsInitials, AWSInitials } from './config.js';
import { logLevels, writeLog } from './logger.js';

//Height calculations
const height = document.querySelector('#content-group-1').clientHeight || document.querySelector('#content-group-1').offsetHeight;
document.querySelector('.content').style.height = height + 'px';

//#region init leaflet map

const mapLeaflet = L.map('map_left', {

    center: [HEREInitials.Center.lat, HEREInitials.Center.lng],
    zoom: 11,
    layers: [L.tileLayer(HEREInitials.MapTileURLSuffix + `/${HEREInitials.MapTileStyle_Default}/{z}/{x}/{y}/512/png8?apiKey=${HEREInitials.Credentials.APIKey}&ppi=320`)]
});

mapLeaflet.zoomControl.setPosition('topright');

//init, and add attributions to the map
mapLeaflet.attributionControl.addAttribution(HEREInitials.Center.text);
//map.attributionControl.addAttribution(HEREInitials.Attribution);

var marker_Leaflet;
// Creating MapkeyIcon object
var mki = L.icon.mapkey({
    icon: "car", color: '#725139', background: '#f2c357', size: 30
});

//#endregion

//#region init HERE Maps

// Initialize HERE Map
const platform = new H.service.Platform({ apikey: HEREInitials.Credentials.APIKey });
const defaultLayers = platform.createDefaultLayers();

const mapHERE = new H.Map(document.getElementById('map_right'), defaultLayers.vector.normal.map, {
    center: HEREInitials.Center,
    zoom: HEREInitials.Zoom,
    tilt: HEREInitials.Tilt,
    pixelRatio: window.devicePixelRatio || 1
});

const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapHERE));
// Create the default UI components
var ui = H.ui.UI.createDefault(mapHERE, defaultLayers);

var mapSettings = ui.getControl('mapsettings');
var zoom = ui.getControl('zoom');
var scalebar = ui.getControl('scalebar');

mapSettings.setAlignment('bottom-right');
zoom.setAlignment('bottom-right');
scalebar.setAlignment('bottom-right');

var marker_HERE;


//#endregion




