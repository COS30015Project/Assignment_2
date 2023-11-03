function init() {
    const width = 1000;
    const height = 700;

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

    const colorScheme = d3.scaleSequential(d3.interpolateGnBu);

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

        // Set the color domain based on the range of total values
        const totalValues = Object.values(processedTotal).map(d => d.Total);
        colorScheme.domain([d3.min(totalValues), d3.max(totalValues)]);

        // Create a tooltip
        var Tooltip = d3.select("#chart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute"); // Set tooltip position to absolute

        // Function for mouseover event
        var mouseover = function (event, d) {
            Tooltip.style("opacity", 1);

            // Calculate tooltip position next to the mouse cursor
            Tooltip.style("left", (event.pageX + 10) + "px");
            Tooltip.style("top", (event.pageY + 10) + "px");

            if (selectedState !== d) {
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1);
                const stateName = d.properties.NAME;
                const total = processedTotal[stateName].Total;
                Tooltip.html(`State: ${stateName}<br>Total: ${total}`);
            }
        };

        // Function for mousemove event
        var mousemove = function (event, d) {
            if (selectedState === d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                Tooltip.html(stateName + "<br>" + formattedData);
            }
        };

        // Function for mouseleave event
        var mouseleave = function (event, d) {
            Tooltip.style("opacity", 0);
            if (selectedState !== d) {
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8);
            }
        };

        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "feature")
            .style("fill", function (d) {
                const stateName = d.properties.NAME;
                const total = processedTotal[stateName].Total;
                return colorScheme(total); // Set color based on total value
            })
            .on("click", clicked)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // Reset function
        function reset() {
            selectedState = null;
            g.selectAll(".feature").style("fill", function (d) {
                return color(d.properties.NAME);
            });
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

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

            if (selectedState !== d) {
                reset();
                selectedState = d;
                d3.select(this).style("fill", "red");
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
                );
            } else {
                reset();
            }
        }

        function formatData(data) {
            const formattedData = [];
            for (const category in data) {
                formattedData.push(`${category}: ${data[category]}`);
            }
            return formattedData.join("<br>");
        }

        // Create the legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20, " + (height - 30) + ")");

        const legendRectSize = 18;
        const legendSpacing = 4;

        const legendColors = colorScheme.range().map(color => color);

        const legendLabels = [d3.min(totalValues), d3.max(totalValues)];

        legend.selectAll(".legend-rect")
            .data(legendColors)
            .enter()
            .append("rect")
            .attr("class", "legend-rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("x", (d, i) => i * (legendRectSize + legendSpacing))
            .style("fill", d => d);

        legend.selectAll(".legend-label")
            .data(legendLabels)
            .enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize + 5)
            .attr("y", legendRectSize - 4)
            .text(d => d);
    });
}

window.onload = init;
