//store URL for the geojson data
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//get data using D3
d3.json(url).then(function (data) {
    console.log(data.features);
    createFeatures(data.features)
});

//Function to determine marker color by depth
function chooseColor(depth) {
    if (depth < 10) return "#00FF00";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "red";
    else return "#FF0000";
}

function createFeatures(earthquakeData) {
    //give feature a popup for place and time
    function onEachFeature(feature, layer) {
        console.log(feature);
        layer.bindPopup(`<h3> Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
        
    }

    //create geojson layer containing the features
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {
            var markers = {
                radius: feature.properties.mag * 20000,
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                weight: 0.5
            }
            return L.circle(latlng, markers);
        }
    });
//api_key = 
//Create tile layers
// var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     style: 'mapbox/satellite-v9',
//     maxZoom: 18,
//     accessToken: api_key
// });
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     style: 'mapbox/light-v11',
//     accessToken: api_key
// });    

// var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     style: 'mapbox/outdoors-v12',
//     accessToken: api_key
// });

    
    //create layers for tectonic_url
    var tectonicPlates = L.layerGroup();

    d3.json(tectonic_url).then(function(plates) {
        L.geoJSON(plates, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
    }).catch(function(error) {
        console.error("Error fetching tectonic plate data:", error);
    });

//create baseMaps object
    var baseMaps = {
        // "satellite": satellite,
        "streetmap": streetmap
        // "grayscale": grayscale,
        // "outdoors": outdoors
    };

    //create an overlay object
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };
// Create a map instance
var map = L.map('map', {
    center: [39, -111], // Set initial map center
    zoom: 5, // Set initial zoom level
    layers: [streetmap] // Set default basemap
});
console.log("map")
    //create map
    //var myMap = L.map("map", {
       // center: [37.09, -95.71],
       // zoom: 5,
       // layers: [satellite, earthquakes, tectonicPlates]
    //});

    //add legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
        var depthRanges = [-10, 10, 30, 50, 70, 90];
        for (var i = 0; i < depthRanges.length; i++) {
            div.innerHTML += '<i style="background:' + chooseColor(depthRanges[i] + 1) + '">&nbsp;</i> ' +
                depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
        }
        return div;
    };


    legend.addTo(map);
    
    function chooseColor(depth) {
        console.log("Depth:", depth);
        if (depth < 10) return "#00FF00"; // Green
        else if (depth < 30) return "greenyellow"; // Yellow-Green
        else if (depth < 50) return "yellow"; // Yellow
        else if (depth < 70) return "orange"; // Orange
        else if (depth < 90) return "red"; // Red
        else return "#FF0000"; // Dark Red
    }
    // Create layer control
// var baseMaps = {
//     "Streets": streetsLayer,
//     "Basemap": basemapLayer,
//     "Dark Mode": darkModeLayer
// };

L.control.layers(baseMaps, overlayMaps).addTo(map);
}
    // Create layer control
    //L.control.layers(baseMaps, overlayMaps, {
      //  collapsed: false
    //}).addTo(myMap)}