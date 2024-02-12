// Create url
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Use d3 to create request
d3.json(url).then(function (data) {
    console.log(data);

    createMapFeatures(data);
});

// Marker size
function markerSize(magnitude) {
    return magnitude * 2500;
};

// Marker color
function markerColor(depth) {
    if (depth < 10) return "#8176ff";
    else if (depth < 30) return "#fbff00";
    else if (depth < 50) return "#0007ff";
    else if (depth < 70) return "#ff00f8";
    else if (depth < 90) return "#0fff00";
    else return "#00fff9";
};

// Map features
function createMapFeatures(earthquakeDetails) {

    // Marker popup
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}
        </p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    };

    // Gather data in array
    var earthquakes = L.geoJSON(earthquakeDetails, {
        onEachFeature: onEachFeature,

        // Point to layer
        pointToLayer: function (feature, latlng) {

            // Create markers
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: 'black',
                weight: 1
            }
            return L.circle(latlng, markers);
        }
    });

    // Add to create map function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Base layers
    var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Base map
    var baseMaps = {
        "Street Map": streetMap,
        "Topographic Map": topoMap
    };

    // Overlay map
    var overlayMap = {
        Earthquakes: earthquakes
    };

    // My map
    var myMap = L.map("map", {
        center: [13.7942, -88.8965],
        zoom: 5,
        layers: [streetMap, earthquakes],
    });

    // Layer control
    L.control.layers(baseMaps, overlayMap, {
        collapsed: false
    }).addTo(myMap);

    // Add legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = '#e6e1f0'; 
            div.style.padding = '10px'; 
            div.style.border = '2px solid black'; 
            div.innerHTML += "<h4 style='text-align: center'>Legend by Depth (km)</h4>";
    
        var legendContent = ''; 
    
        var depthRanges = ['0-10', '10-30', '30-50', '50-70', '70-90', '90+'];

    // loop through our depth levels and generate a label with a colored square for each interval
    for (var i = 0; i < depthRanges.length; i++) {
        var startDepth = i * 20; 
        var color = markerColor(startDepth); 
        legendContent +=
            '<div><span style="display:inline-block; width:20px; height:20px; background-color:' + color + ';"></span> ' +
            depthRanges[i] + '</div>';
    }

    div.innerHTML += legendContent; 

    return div;
};

legend.addTo(myMap);

}