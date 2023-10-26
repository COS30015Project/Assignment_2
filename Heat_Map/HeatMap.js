function init() {
    const width = 1200; // Width of the SVG
    const height = 1000; // Height of the SVG

    const colorScheme = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"];

    const projection = d3.geoAlbersUsa() // Use Albers USA projection for the US map
        .scale(1000) // Adjust the scale as needed
        .translate([width / 2, height / 2]);

    // Set up the path generator
    const path = d3.geoPath()
        .projection(projection);

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g");

    const color = d3.scaleOrdinal().range(colorScheme); // Define the color scale

    // Load the GeoJSON data
    d3.json("usa.json").then(function (json) { // Replace "usa.json" with the path to your GeoJSON file
        // Load the CSV data
        d3.csv("us_migration_map.csv").then(function (data) {
            // Create a map to store values associated with states
            const stateValueMap = new Map();

            // Process the CSV data and populate the map
            data.forEach(function (d) {
                const state = d['State of intended residence'];
                const value = parseFloat(d['Year: 2022']);

                stateValueMap.set(state, value);
            });

            g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "feature") // Use a class for styling
                .style("fill", function (d) {
                    const state = d.properties.NAME;
                    const value = stateValueMap.get(state);
                    return color(value || 0); // Use the color scale based on the value
                })
                .on("click", clicked)
                .append("title") // Add a title element for showing state name and value
                .text(function (d) {
                    const state = d.properties.NAME;
                    const value = stateValueMap.get(state);
                    return `${state}: ${value || 0}`;
                });
        });

        // Define a reset function for zoom
        function reset() {
            g.selectAll(".feature").style("fill", function (d, i) {
                return color(i % colorScheme.length); // Reset to the color scheme
            });
            g.transition().call(zoom.transform, d3.zoomIdentity);
        }

        // Define the zoomed function
        function zoomed(event) {
            g.attr("transform", event.transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        svg.call(zoom); // Call the zoom function

        // Handle click events
        function clicked(event, d) {
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            event.stopPropagation();
            reset(); // Reset colors first
            d3.select(this).style("fill", "red"); // Highlight the clicked area
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, svg.node())
            );
        }

        // Attach a click event to reset zoom
        svg.on("click", reset);
    });
}

// Call the init function when the window loads
window.onload = init;
