// Define a function to initialize the map
function initMap() {
    var w = 800; // Width of the SVG
    var h = 500; // Height of the SVG

    var colorScheme = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"];

    var projection = d3.geoAlbersUsa() // Use Albers USA projection for the US map
        .scale(1000) // Adjust the scale as needed
        .translate([w / 2, h / 2]);

    // Set up the path generator
    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var g = svg.append("g");

    var color = d3.scaleOrdinal().range(colorScheme); // Define the color scale

    d3.json("usa.json").then(function (json) { // Replace "usa.json" with the path to your GeoJSON file
        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "feature") // Use a class for styling
            .style("fill", function (d, i) {
                return color(i % colorScheme.length); // Apply the color scheme
            });

        // Define a reset function for zoom
        function reset() {
            g.transition().call(zoom.transform, d3.zoomIdentity);
        }

        // Define the zoomed function
        function zoomed(event) {
            g.attr("transform", event.transform);
        }

        // Attach a click event to reset zoom
        svg.on("click", reset);
    });
}

// Call the initMap function when the window loads
window.onload = initMap;
