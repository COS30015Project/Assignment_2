function init() {
    const width = 1200;
    const height = 1000;
    const padding = 25;

    const colorScheme = [
        "#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"
    ];

    const projection = d3.geoAlbersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath()
        .projection(projection);

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + padding)
        .attr("height", height + padding);

    const g = svg.append("g");

    const color = d3.scaleOrdinal().range(colorScheme);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    const totalByState = new Map(); // Create a map to store the Asian migration data by state

    // Load the U.S. state GeoJSON data
    d3.json("usa.json").then(function (usData) {
        // Load your Asian migration data
        d3.csv("us_migration_map.csv").then(function (asianData) {
            asianData.forEach(function (d) {
                d.state = d['State of intended residence'];
                // Aggregate the total number of migrants by state
                totalByState.set(d.state, +d['Total']);
            });

            const states = g.append("g")
                .attr("fill", "#444")
                .attr("cursor", "pointer")
                .selectAll("path")
                .data(usData.features)
                .join("path")
                .on("click", clicked)
                .attr("d", path);

            states.append("title")
                .text(d => d.properties.NAME);

            g.append("path")
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-linejoin", "round")
                .attr("d", path(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b)));

            g.selectAll("text") // Add text labels with state names
                .data(usData.features)
                .enter()
                .append("text")
                .attr("x", function (d) {
                    return path.centroid(d)[0];
                })
                .attr("y", function (d) {
                    return path.centroid(d)[1];
                })
                .text(function (d) {
                    return d.properties.NAME;
                })
                .style("text-anchor", "middle")
                .style("font-size", "5px")
                .style("fill", "black");

            function showAsianMigrationData(d) {
                const stateName = d.properties.NAME;
                const totalMigrants = totalByState.get(stateName);
                alert(`Asian Migration Data for ${stateName}: ${totalMigrants} migrants`);
            }

            function reset() {
                states.transition().style("fill", null);
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                );
            }

            function clicked(event, d) {
                const [[x0, y0], [x1, y1]] = path.bounds(d);
                event.stopPropagation();
                reset();
                d3.select(this).transition().style("fill", "red");
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.pointer(event, svg.node())
                );
                showAsianMigrationData(d);
            }

            function zoomed(event) {
                const { transform } = event;
                g.attr("transform", transform);
                g.attr("stroke-width", 1 / transform.k);
            }
        });
    });
}

window.onload = init;