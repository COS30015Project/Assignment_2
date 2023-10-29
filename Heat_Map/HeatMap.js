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

    let selectedState = null; // Track the selected state

    // Initialize processedTotal
    const processedTotal = {};

    let bubbleG; // Define bubbleG at the top level

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
            processedTotal[stateName] = {
                Total: +d.Total
            }
        });

        const totalMigration = calculateTotalMigration(processedData);

        // Add a total population display
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
            .style("fill", function (d) {
                return color(d.properties.NAME);
            })
            .on("click", clicked)
            .on("mouseover", function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                d3.select(this).style("fill", "blue"); // Change color on mouseover
                displayMigrationInfo(stateName, formattedData);
            })
            .on("mouseout", function () {
                if (selectedState === null) {
                    d3.select(this).style("fill", function (d) {
                        return color(d.properties.NAME);
                    }); // Restore original color on mouseout
                    hideMigrationInfo();
                }
            })
            .append("title")
            .text(function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                return stateName + "\n" + formattedData;
            });

        // Panning behavior
        svg.call(d3.drag()
            .subject(() => ({ x: 0, y: 0 }))
            .on("start", started)
            .on("drag", dragged));

        function started() {
            // Disable click event when dragging
            svg.on(".click", null);
        }

        function dragged(event) {
            g.attr("transform", d3.event.transform);
        }

        // Reset function
        function reset() {
            g.selectAll(".feature").style("fill", function (d) {
                return color(d.properties.NAME);
            });
            selectedState = null; // Reset the selected state
            g.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

        // Zooming behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed(event) {
            g.attr("transform", event.transform);
        }

        function clicked(event, d) {
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            event.stopPropagation();
            reset();
            selectedState = d; // Store the selected state
            d3.select(this).style("fill", "red");
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, svg.node())
            );
        }

        svg.on("click", reset);

        // Define the bubbleG within the Promise scope
        bubbleG = svg.append("g").classed("animated-bubbles", true);

        // Add animated bubbles
        const states = json.features.map(d => d.properties.NAME);
        animateBubbles(states, processedData);
    });

    function displayMigrationInfo(stateName, formattedData) {
        d3.select(".total-population")
            .text(stateName + "\n" + formattedData);
    }

    function hideMigrationInfo() {
        const totalMigration = calculateTotalMigration(processedData);
        d3.select(".total-population").text("Total Migration: " + totalMigration);
    }
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

function animateBubbles(states, data) {
    const delay = 500; // Adjust the delay as needed
    const duration = 1000; // Adjust the duration as needed

    let index = 0;
    function drawNextBubble() {
        if (index >= states.length) {
            return; // All states processed
        }

        const stateName = states[index];
        const totalMigration = data[stateName].Total;
        const [x, y] = projection([0, 0]); // Replace [0, 0] with the coordinates you want to place the bubble

        bubbleG.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 0)
            .attr("fill", "black")
            .transition()
            .duration(duration)
            .attr("r", totalMigration) // Adjust bubble size based on total migration
            .on("end", () => {
                // Move to the next state
                index++;
                setTimeout(drawNextBubble, delay);
            });
    }

    drawNextBubble(); // Start the animation
}

window.onload = init;
