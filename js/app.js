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


//#region business logic

$('#HERE-w3w_search').autocomplete({
    source: HEREw3w_AutoSuggest,
    minLength: 2,
    select: function (event, ui) {
        if (ui.item.userTag === '///w3w') {
            var reqData = {
                "query": {
                    "term": query.term,
                    "lat": mapLeaflet.getCenter().lat,
                    "lng": mapLeaflet.getCenter().lng
                },
                "operation": "w3wReverseGeocode"
            };

            $.ajax({
                url: AWSInitials.APIGateways.HEREw3w,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(reqData),
                success: function (data) {
                    writeLog(logLevels.info, ("Response data: " + data), '');

                    if (data.statusCode === 200) {

                        if (data.respOperation === 'w3wReverseGeocode') {

                            document.querySelector('#HERE-w3w_words').innerHTML = JSON.parse(data.body).items[0].address.label;

                            ////mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                            mapHERE.getViewModel().setLookAtData({
                                position: address.items[0].position,
                                zoom: HEREInitials.Zoom,
                                heading: HEREInitials.Heading,
                                tilt: HEREInitials.Tilt
                            }, true);

                            if (!marker_Leaflet) {
                                marker_Leaflet = L.marker([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                                marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                                marker_Leaflet.addTo(mapLeaflet);
                            } else {
                                marker_Leaflet.setLatLng([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                                marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                                marker_Leaflet.addTo(mapLeaflet);
                            }
                            mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                            if (!marker_HERE) {
                                marker_HERE = new H.map.Marker(address.items[0].position);
                                mapHERE.addObject(marker_HERE);
                            } else {
                                marker_HERE.setGeometry(address.items[0].position);
                            }

                            mapHERE.getViewModel().setLookAtData({
                                position: address.items[0].position,
                                zoom: HEREInitials.Zoom,
                                heading: HEREInitials.Heading,
                                tilt: HEREInitials.Tilt
                            }, true);
                        }
                        else if (data.respOperation === 'HEREReverseGeocode') {

                        }
                    }

                    else {
                        writeLog(logLevels.alert, data.statusCode, '');
                    }
                },
                error: function (data) {
                    writeLog(logLevels.error, data, '');
                }
            });



            $.get(AWSInitials.APIGateways.HEREw3w, reqData, function (data) {
                writeLog(logLevels.info, ("Response data: " + data), '');

                if (data.statusCode === '200') {

                    if (data.respOperation === 'w3wAutoSuggest') {
                        //result is from what3words words autosuggest
                        var words = JSON.parse(data.body).suggestions.filter(place => place.nearestPlace);
                        words = words.map(place => {
                            return {
                                title: place.words,
                                value: '///' + place.words + ',' + place.nearestPlace + '(Distance to Focus: ' + place.distanceToFocusKm + ' KM)',
                                distance: place.distanceToFocusKm,
                                userTag: '///w3w'
                            };
                        });

                        // limit display to 10 results
                        return callback(words.slice(0, 10));
                    }

                    else if (data.respOperation === 'HEREAutoSuggest') {
                        //result is from HERE words autosuggest
                        var places = JSON.parse(data.body).results.filter(place => place.vicinity);
                        places = places.map(place => {
                            return {
                                title: place.title,
                                value: place.title + ',' + place.vicinity.replace(/<br\/>/g, ", ") + '(' + place.category + ')',
                                distance: place.distance,
                                id: place.id,
                                position: place.position,
                                userTag: 'HERE'
                            };
                        });

                        // limit display to 10 results
                        return callback(places.slice(0, 10));
                    }
                    else if (data.respOperation === 'w3wReverseGeocode') {
                        document.querySelector('#HERE-w3w_words').innerHTML = JSON.parse(data.body).items[0].address.label;

                        ////mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                        mapHERE.getViewModel().setLookAtData({
                            position: address.items[0].position,
                            zoom: HEREInitials.Zoom,
                            heading: HEREInitials.Heading,
                            tilt: HEREInitials.Tilt
                        }, true);

                        //if (!marker_Leaflet) {
                        //    marker_Leaflet = L.marker([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: address.items[0].address.label });
                        //    marker_Leaflet.bindPopup(address.items[0].address.label).openPopup();
                        //    marker_Leaflet.addTo(mapLeaflet);
                        //} else {
                        //    marker_Leaflet.setLatLng([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: address.items[0].address.label });
                        //    marker_Leaflet.bindPopup(address.items[0].address.label).openPopup();
                        //    marker_Leaflet.addTo(mapLeaflet);
                        //}
                        //mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                        if (!marker_Leaflet) {
                            marker_Leaflet = L.marker([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                            marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                            marker_Leaflet.addTo(mapLeaflet);
                        } else {
                            marker_Leaflet.setLatLng([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                            marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                            marker_Leaflet.addTo(mapLeaflet);
                        }
                        mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                        if (!marker_HERE) {
                            marker_HERE = new H.map.Marker(address.items[0].position);
                            mapHERE.addObject(marker_HERE);
                        } else {
                            marker_HERE.setGeometry(address.items[0].position);
                        }

                        mapHERE.getViewModel().setLookAtData({
                            position: address.items[0].position,
                            zoom: HEREInitials.Zoom,
                            heading: HEREInitials.Heading,
                            tilt: HEREInitials.Tilt
                        }, true);
                    }
                    else if (data.respOperation === 'HEREReverseGeocode') {
                    }
                }

                else {
                    writeLog(logLevels.alert, data.statusCode, '');
                }
            });

            //alert('///w3w');

            let url_What3Words_Convert2Coordinates = $.getJSON("https://api.what3words.com/v3/convert-to-coordinates?words=" + ui.item.title + "&format=json" + "&key=" + What3WordsInitials.Credentials.APIKey);

            $.when(url_What3Words_Convert2Coordinates).done(function (result) {

                let url_HEREReverseGeocoding = $.getJSON("https://revgeocode.search.hereapi.com/v1/revgeocode?at=" + result.coordinates.lat + "," + result.coordinates.lng + "&apikey=" + HEREInitials.Credentials.APIKey);

                $.when(url_HEREReverseGeocoding).done(function (address) {
                    document.querySelector('#HERE-w3w_words').innerHTML = address.items[0].address.label;

                    ////mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                    mapHERE.getViewModel().setLookAtData({
                        position: address.items[0].position,
                        zoom: HEREInitials.Zoom,
                        heading: HEREInitials.Heading,
                        tilt: HEREInitials.Tilt
                    }, true);

                    //if (!marker_Leaflet) {
                    //    marker_Leaflet = L.marker([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: address.items[0].address.label });
                    //    marker_Leaflet.bindPopup(address.items[0].address.label).openPopup();
                    //    marker_Leaflet.addTo(mapLeaflet);
                    //} else {
                    //    marker_Leaflet.setLatLng([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: address.items[0].address.label });
                    //    marker_Leaflet.bindPopup(address.items[0].address.label).openPopup();
                    //    marker_Leaflet.addTo(mapLeaflet);
                    //}
                    //mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                    if (!marker_Leaflet) {
                        marker_Leaflet = L.marker([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                        marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                        marker_Leaflet.addTo(mapLeaflet);
                    } else {
                        marker_Leaflet.setLatLng([address.items[0].position.lat, address.items[0].position.lng], { icon: mki, title: ('///' + ui.item.title) });
                        marker_Leaflet.bindPopup(('///' + ui.item.title)).openPopup();
                        marker_Leaflet.addTo(mapLeaflet);
                    }
                    mapLeaflet.flyTo([address.items[0].position.lat, address.items[0].position.lng], HEREInitials.Zoom);

                    if (!marker_HERE) {
                        marker_HERE = new H.map.Marker(address.items[0].position);
                        mapHERE.addObject(marker_HERE);
                    } else {
                        marker_HERE.setGeometry(address.items[0].position);
                    }

                    mapHERE.getViewModel().setLookAtData({
                        position: address.items[0].position,
                        zoom: HEREInitials.Zoom,
                        heading: HEREInitials.Heading,
                        tilt: HEREInitials.Tilt
                    }, true);
                });
            });
        }
        else if (ui.item.userTag === 'HERE') {
            //alert('HERE');

            what3words_Reverse(ui.item.position[0], ui.item.position[1]);

            //console.log("Selected: " + ui.item.value + " with LocationId " + ui.item.id);
            mapLeaflet.flyTo(ui.item.position, HEREInitials.Zoom);


            mapHERE.getViewModel().setLookAtData({
                position: { lat: ui.item.position[0], lng: ui.item.position[1] },
                zoom: HEREInitials.Zoom,
                heading: HEREInitials.Heading,
                tilt: HEREInitials.Tilt
            }, true);



            if (!marker_Leaflet) {
                marker_Leaflet = L.marker([ui.item.position[0], ui.item.position[1]], { icon: mki, title: ui.item.value });
                marker_Leaflet.bindPopup(ui.item.value).openPopup();
                marker_Leaflet.addTo(mapLeaflet);
            } else {
                marker_Leaflet.setLatLng([ui.item.position[0], ui.item.position[1]], { icon: mki, title: ui.item.value });
                marker_Leaflet.bindPopup(ui.item.value).openPopup();
                marker_Leaflet.addTo(mapLeaflet);
            }
            mapLeaflet.flyTo(ui.item.position, HEREInitials.Zoom);


            if (!marker_HERE) {
                marker_HERE = new H.map.Marker({ lat: ui.item.position[0], lng: ui.item.position[1] });
                mapHERE.addObject(marker_HERE);
            } else {
                marker_HERE.setGeometry({ lat: ui.item.position[0], lng: ui.item.position[1] });
            }
            mapHERE.getViewModel().setLookAtData({
                position: { lat: ui.item.position[0], lng: ui.item.position[1] },
                zoom: HEREInitials.Zoom,
                heading: HEREInitials.Heading,
                tilt: HEREInitials.Tilt
            }, true);


        }
    }
});

function HEREw3w_AutoSuggest(query, callback) {
    try {
        document.querySelector('#HERE-w3w_words').innerHTML = '...';

        var reqData = {
            "query": {
                "term": query.term,
                "lat": mapLeaflet.getCenter().lat,
                "lng": mapLeaflet.getCenter().lng
            },
            "operation": "AutoSuggest"
        };

        $.ajax({
            url: AWSInitials.APIGateways.HEREw3w,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(reqData),
            success: function (data) {
                writeLog(logLevels.info, ("Response data: " + data), '');

                if (data.statusCode === 200) {

                    if (data.respOperation === 'w3wAutoSuggest') {
                        //result is from what3words words autosuggest
                        var words = JSON.parse(data.body).suggestions.filter(place => place.nearestPlace);
                        words = words.map(place => {
                            return {
                                title: place.words,
                                value: '///' + place.words + ',' + place.nearestPlace + '(Distance to Focus: ' + place.distanceToFocusKm + ' KM)',
                                distance: place.distanceToFocusKm,
                                userTag: '///w3w'
                            };
                        });

                        // limit display to 10 results
                        return callback(words.slice(0, 10));
                    }

                    else if (data.respOperation === 'HEREAutoSuggest') {
                        //result is from HERE words autosuggest
                        var places = JSON.parse(data.body).results.filter(place => place.vicinity);
                        places = places.map(place => {
                            return {
                                title: place.title,
                                value: place.title + ',' + place.vicinity.replace(/<br\/>/g, ", ") + '(' + place.category + ')',
                                distance: place.distance,
                                id: place.id,
                                position: place.position,
                                userTag: 'HERE'
                            };
                        });

                        // limit display to 10 results
                        return callback(places.slice(0, 10));
                    }
                    else if (data.respOperation === 'w3wReverseGeocode') {
                    }
                    else if (data.respOperation === 'HEREReverseGeocode') {
                    }
                }

                else {
                    writeLog(logLevels.alert, data.statusCode, '');
                }
            },
            error: function (data) {
                writeLog(logLevels.error, data, '');
            }
        });

    } catch (e) {
        writeLog(logLevels.exception, e, '');
    }

}

//#endregion
