// define urls
var API_quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(API_quakes)
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(API_plates)

// define markers for the map
function markerSize(magnitude) {
    return magnitude * 4;
};


var earthquakes = new L.LayerGroup();

// setup the call to grab the geojson data for the earthquakes
d3.json(API_quakes, function(geoJson) {
    L.geoJSON(geoJson.features, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },

        style: function(geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h4> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }
    }).addTo(earthquakes);
    createMap(earthquakes);
});

// setup the call to grab the geojson data for the plates/fault lines
var plateBoundary = new L.LayerGroup();

d3.json(API_plates, function(geoJson) {
    L.geoJSON(geoJson.features, {
        style: function(geoJsonFeature) {
            return {
                weight: 2,
                color: 'magenta'
            }
        },
    }).addTo(plateBoundary);
})

// define the marker colors as they relate to the earthquake magnitudes
function Color(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'darkorange'
    } else if (magnitude > 3) {
        return 'tan'
    } else if (magnitude > 2) {
        return 'yellow'
    } else if (magnitude > 1) {
        return 'darkgreen'
    } else {
        return 'lightgreen'
    }
};
// create layers for the map
function createMap() {

    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: 'pk.eyJ1IjoicGhoYXJtb24iLCJhIjoiY2t6MDI1eXB6MTdtazJ1cDMzb2U2ZTg1NyJ9.i71bGoClKM7sxBp9wnyuYQ'
    });

    var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicGhoYXJtb24iLCJhIjoiY2t6MDI1eXB6MTdtazJ1cDMzb2U2ZTg1NyJ9.i71bGoClKM7sxBp9wnyuYQ'
    });

    var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1IjoicGhoYXJtb24iLCJhIjoiY2t6MDI1eXB6MTdtazJ1cDMzb2U2ZTg1NyJ9.i71bGoClKM7sxBp9wnyuYQ'
    });


    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoicGhoYXJtb24iLCJhIjoiY2t6MDI1eXB6MTdtazJ1cDMzb2U2ZTg1NyJ9.i71bGoClKM7sxBp9wnyuYQ'
    });

    // set up the base layer
    var baseLayers = {
        "High Contrast": highContrastMap,
        "Street": streetMap,
        "Dark": darkMap,
        "Satellite": satellite
    };

    var overlays = {
        "Earthquakes": earthquakes,
        "Plate Boundaries": plateBoundary,
    };

    // set up how the initial map should look and the geographical point of reference
    var mymap = L.map('mymap', {
        center: [39.83333, -98.58333],
        zoom: 5,
        layers: [streetMap, earthquakes, plateBoundary]
    });

    L.control.layers(baseLayers, overlays).addTo(mymap);

    // set up legend and its placement
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);
}
