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

    // Load both CSV and GeoJSON data
    Promise.all([
        d3.csv("us_migration_data.csv"),
        d3.json("usa.json")
    ]).then(function (data) {
        const csvData = data[0];
        const geojsonData = data[1];

        // Bind the GeoJSON data to the map elements
        g.selectAll("path")
            .data(geojsonData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                // Get the state name
                const state = d.properties.name;
                // Calculate the total migration to the state from all countries
                const rowData = csvData.find(row => row["US States"] === state);
                if (rowData) {
                    // Calculate the total migration for the state
                    const totalMigration = d3.sum(d3.values(rowData).slice(1, -1), d => +d);
                    return color(totalMigration);
                }
                return "#fff"; // Default color for states with no data
            });
    });
}

window.onload = init;
