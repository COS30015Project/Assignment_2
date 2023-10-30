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

    let selectedState = null;

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
            .append("title")
            .text(function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                return stateName + "\n" + formattedData;
            });

        // Draw bubbles for each state
        json.features.forEach(function (state) {
            drawBubble(state);
        });

        // Reset function
        function reset() {
            g.selectAll(".feature").style("fill", function (d) {
                return color(d.properties.NAME);
            });
            selectedState = null; // Reset the selected state
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
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
            if (selectedState !== d) {
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
            } else {
                reset();
            }
        }

        // Function to draw a bubble for a state
        function drawBubble(state) {
            // Calculate the centroid of the state boundary
            const centroid = path.centroid(state);
            const cx = centroid[0];
            const cy = centroid[1];

            if (!isNaN(cx) && !isNaN(cy)) {
                g.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", 0) // Start with a radius of 0
                    .style("fill", color(processedTotal[state.properties.NAME].Total))
                    .transition()
                    .duration(1000) // Animation duration
                    .attr("r", 5); // Adjust the scale for appropriate bubble size
            }
        }

        function formatData(data) {
            const formattedData = [];
            for (const category in data) {
                formattedData.push(`${category}: ${data[category]}`);
            }
            return formattedData.join("\n");
        }
    });
}

window.onload = init;
