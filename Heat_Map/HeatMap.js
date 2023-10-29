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

    Promise.all([
        d3.json("usa.json"), // Load GeoJSON data
        d3.csv("us_migration_data.csv") // Load CSV data
    ]).then(function (data) {
        const json = data[0];
        const csvData = data[1];

        const processedData = {};
        const processedTotal = {};

        csvData.forEach(function (d) {
            const stateName = d['US States'];
            processedData[stateName] = {
                Bangladesh: +d.Bangladesh,
                China: +d.China,
                India: +d.India,
                Iran: +d.Iran,
                Korea: +d.Korea,
                Pakistan: +d.Pakistan,
                Philippines: +d.Philippines,
                Taiwan: +d.Taiwan,
                Vietnam: +d.Vietnam,
                Others: +d.Others,
            };

            processedTotal[stateName] = {
                Total: +d.Total, 
            };
        });

        // Function to draw a bubble for a state
        function drawBubble(state) {
            g.append("circle")
                .attr("cx", projection([state.lon, state.lat])[0])
                .attr("cy", projection([state.lon, state.lat])[1])
                .attr("r", 0) // Start with a radius of 0
                .style("fill", color(processedTotal[state.name]))
                .transition()
                .duration(1000) // Animation duration
                .attr("r", processedTotal[state.name] / 100); // Adjust the scale for appropriate bubble size
        }

        // Draw bubbles for each state
        json.features.forEach(function (d) {
            const stateName = d.properties.NAME;
            const state = {
                name: stateName,
                lat: d.properties.LAT,
                lon: d.properties.LON,
            };
            setTimeout(function () {
                drawBubble(state);
            }, 1000); // Delay each state's bubble animation
        });
    });
}

window.onload = init;