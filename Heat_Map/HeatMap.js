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

    d3.json("usa.json").then(function (usData) {
        d3.csv("us_migration_map.csv").then(function (asianData) {
            // Handle data loading errors
            if (!usData || !asianData) {
                console.error("Error loading data");
                return;
            }

            // Data processing and rendering here

            function showAsianMigrationData(d, totalByState) {
                // Display Asian migration data for a state
                // You can use a better way to show data, like a tooltip or a separate info panel
                const stateName = d.properties.NAME;
                const totalMigrants = totalByState.get(stateName);
                alert(`Asian Migration Data for ${stateName}: ${totalMigrants} migrants`);
            }

            function reset() {
                // Reset the map and colors
                g.selectAll(".feature").style("fill", function (d) {
                    const stateName = d.properties.NAME;
                    const totalMigrants = totalByState.get(stateName);
                    return color(totalMigrants);
                });
                g.transition().call(zoom.transform, d3.zoomIdentity);
            }

            svg.on("click", reset);
        });
    });
}

window.onload = init;
