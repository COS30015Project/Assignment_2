function init() {
    var w = 800; // Increased the width for better visualization
    var h = 500; // Increased the height for better visualization

    var projection = d3.geoMercator()
        .center([145, -36.5])
        .translate([w / 2, h / 2])
        .scale(700); // Adjusted the scale

    // Set up the path generator
    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Add a group for the map features
    var g = svg.append("g");

    d3.json("USA_State.geojson").then(function (geojson) {
        // Append path elements for each feature in the JSON data
        g.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "feature"); // Use a class for styling

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

        // Create a zoom behavior for the SVG
        var zoom = d3.zoom()
        .scaleExtent([1, 8]) // Set your desired scale extent
        .on("zoom", zoomed);

    svg.call(zoom);
}

window.onload = init;