function init() {
    const width = 1200;
    const height = 1000;

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
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g");

    const color = d3.scaleOrdinal().range(colorScheme);

    // Load the CSV data and handle it
    d3.csv("us_migration_data.csv").then(function(data) {
        // Load the GeoJSON data
        d3.json("usa.json").then(function(geojson) {
            // Bind the GeoJSON data to the map elements
            g.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d) {
                    // Get the state name
                    const state = d.properties.name;
                    // Calculate the total migration to the state from all countries
                    const totalMigration = data
                        .filter(function(row) {
                            return row["US States"] === state;
                        })
                        .map(function(row) {
                            return +row["Total"];
                        })
                        .reduce(function(acc, value) {
                            return acc + value;
                        }, 0);
                    return color(totalMigration);
                });
        });
    });
}

window.onload = init;
