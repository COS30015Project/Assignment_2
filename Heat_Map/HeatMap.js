function init() {
    const width = 1200;
    const height = 1000;

    const colorScheme = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"];

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
        d3.json("usa.json"),  // Load GeoJSON data
        d3.csv("us_migration_data.csv")  // Load CSV data
    ]).then(function (data) {
        const json = data[0];
        const csvData = data[1];

        const processedData = {};
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
        });

        // Add a total population display
        const totalPopulationDisplay = svg.append("text")
            .attr("class", "total-population")
            .attr("x", 10)
            .attr("y", 20)
            .text("Total Migration: " + calculateTotalMigration(processedData));

        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "feature")
            .style("fill", function (d) {
                return color(d.properties.NAME);
            })
            .on("click", function (d) {
                clicked(d, processedData);
            })
            .on("mouseover", function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                d3.select(".total-population").text(stateName + "\n" + formattedData);
            })
            .on("mouseout", function () {
                const totalMigration = calculateTotalMigration(processedData);
                d3.select(".total-population").text("Total Migration: " + totalMigration);
            })
            .append("title")
            .text(function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                return stateName + "\n" + formattedData;
            });
    });
}

function formatData(data) {
    const formattedData = [];
    for (const category in data) {
        formattedData.push(`${category}: ${data[category]}`);
    }
    return formattedData.join("\n");
}

function calculateTotalMigration(data) {
    let total = 0;
    for (const stateData of Object.values(data)) {
        for (const category in stateData) {
            total += stateData[category];
        }
    }
    return total;
}

function clicked(d, processedData) {
    const stateName = d.properties.NAME;
    const data = processedData[stateName];
    const formattedData = formatData(data);
    d3.select(".total-population").text(stateName + "\n" + formattedData);
}

window.onload = init;
