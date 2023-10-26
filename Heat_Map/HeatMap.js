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

    d3.json("usa.json").then(function (usData) { // Load the U.S. state GeoJSON data
        d3.csv("us_migration_map.csv").then(function (asianData) { // Load your Asian migration data
            const totalByState = new Map(); // Create a map to store the Asian migration data by state

            asianData.forEach(function (d) {
                d.state = d['State of intended residence'];
                // Aggregate the total number of migrants by state
                totalByState.set(d.state, +d['Total']);
            });

            g.selectAll("path")
                .data(usData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "feature")
                .style("fill", function (d) {
                    const stateName = d.properties.NAME;
                    // Get the total number of Asian migrants for this state
                    const totalMigrants = totalByState.get(stateName);
                    // You can use a color scale to represent the number of migrants
                    return color(totalMigrants);
                })
                .on("click", function (event, d) {
                    showAsianMigrationData(d, totalByState);
                })
                .append("title")
                .text(function (d) {
                    return d.properties.NAME;
                });

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
                .style("font-size", "12px")
                .style("fill", "black");

            function showAsianMigrationData(d, totalByState) {
                const stateName = d.properties.NAME;
                const totalMigrants = totalByState.get(stateName);
                alert(`Asian Migration Data for ${stateName}: ${totalMigrants} migrants`);
            }
        });
    });
}

window.onload = init;
