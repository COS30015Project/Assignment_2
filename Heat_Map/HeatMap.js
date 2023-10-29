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

    // Use Promise.all to load both GeoJSON and CSV data concurrently
    Promise.all([
        d3.json("usa.json"),
        d3.csv("us_migration_data.csv")
    ]).then(function (data) {
        const usData = data[0];
        const csvData = data[1];

        const processedData = {};
        const processedTotal = {}; // Initialize a separate object for 'Total' data

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
                Total: +d.Total
            };
        });

        const totalMigration = calculateTotalMigration(processedData);

        // Add the US state map to the heatmap
        g.selectAll("path")
            .data(usData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                const stateName = d.properties.NAME;
                return color(totalMigration[stateName]);
            })
            .attr("data-state", function (d) {
                return d.properties.NAME;
            })
            .on("mouseover", function (d) {
                const stateName = d3.select(this).attr("data-state");
                const total = totalMigration[stateName];
                const tooltip = createTooltip(stateName, total, d3.event); // Pass the event object

                // Show the tooltip on mouseover
                d3.select("body").append(() => tooltip.node());
            })
            .on("mouseout", function () {
                const stateName = d3.select(this).attr("data-state");
                // Remove the tooltip on mouseout
                d3.selectAll(".tooltip").filter(function () {
                    return d3.select(this).attr("data-state") === stateName;
                }).remove();
            });
    });
}

function calculateTotalMigration(data) {
    const totalMigration = {};
    // Calculate the total migration for each state
    for (const stateName in data) {
        totalMigration[stateName] = d3.sum(Object.values(data[stateName]));
    }
    return totalMigration;
}

function createTooltip(stateName, total, event) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0);

    tooltip.attr("id", stateName);

    tooltip.html(`<b>${stateName}</b><br>Total Migration: ${total}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");

    return tooltip;
}

window.onload = init;
