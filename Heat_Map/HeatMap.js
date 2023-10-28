function init() {
    // Define your constants and variables
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
    let selectedState = null; // Track the selected state

    // Define your functions

    function formatData(data) {
        const formattedData = [];
        for (const category in data) {
            formattedData.push(`${category}: ${data[category]}`);
        }
        return formattedData.join("\n");
    }

    function calculateTotalMigration(data) {
        let total = 0;
        for (const category in data) {
            total += data[category];
        }
        return total;
    }

    function displayMigrationInfo(stateName, formattedData, stateTotal) {
        d3.select(".total-population")
            .text(`${stateName}\n${formattedData}\nTotal Migration for ${stateName}: ${stateTotal}`);
    }

    function hideMigrationInfo(totalMigration) {
        d3.select(".total-population").text(`Total Migration: ${totalMigration}`);
    }

    function reset() {
        g.selectAll(".feature").style("fill", (d) => color(d.properties.NAME));
        selectedState = null;
        g.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }

    function zoomed(event) {
        g.attr("transform", event.transform);
    }

    function clicked(event, d) {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        event.stopPropagation();
        reset();
        selectedState = d;
        d3.select(this).style("fill", "red");
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
            ),
            d3.pointer(event, svg.node())
        );
    }

    function started() {
        svg.on("click", null);
    }

    function dragged(event) {
        g.attr("transform", d3.event.transform);
    }

    // Initialize the map

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

        const totalMigration = calculateTotalMigration(processedData);

        const totalPopulationDisplay = svg.append("text")
            .attr("class", "total-population")
            .attr("x", 10)
            .attr("y", 20)
            .text("Total Migration: " + totalMigration);

        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "feature")
            .style("fill", (d) => color(d.properties.NAME))
            .on("click", clicked)
            .on("mouseover", function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                d3.select(this).style("fill", "blue");
                const stateTotal = calculateTotalMigration(data);
                displayMigrationInfo(stateName, formattedData, stateTotal);
            })
            .on("mouseout", function () {
                if (selectedState === null) {
                    d3.select(this).style("fill", (d) => color(d.properties.NAME));
                    hideMigrationInfo(totalMigration);
                }
            })
            .append("title")
            .text(function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                return stateName + "\n" + formattedData;
            });

        svg.call(d3.drag()
            .subject(() => ({ x: 0, y: 0 }))
            .on("start", started)
            .on("drag", dragged));

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        svg.call(zoom);
    });
}

window.onload = init;
