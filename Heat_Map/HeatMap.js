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
        const maxTotal = d3.max(totalValues);

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

        // Set up zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed(event) {
            g.style("stroke-width", 1.5 / event.transform.k + "px");
            g.attr("transform", event.transform);
        }

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
                return d3.interpolateGnBu(total / maxTotal); // Use gradient color based on total value
            })
            .on("click", clicked)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // Create a dynamic legend based on total migration numbers
        const legendGroup = svg.append("g")
            .attr("transform", "translate(20, 20)");

        const legendTitle = legendGroup.append("text")
            .text("Legend")
            .attr("font-weight", "bold")
            .attr("y", -5);

        // Define your custom color scale and range
        const customColorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, maxTotal]); // Set the domain from 0 to maxTotal

        const legendRectSize = 18;
        const legendSpacing = 4;

        // Generate dynamic legend labels starting from 0
        const legendLabels = generateLegendLabels(maxTotal);

        const legends = legendGroup.selectAll(".legends")
            .data(legendLabels)
            .enter()
            .append("g")
            .attr("class", "legends")
            .attr("transform", function (d, i) {
                const height = legendRectSize + legendSpacing;
                const offset = height * legendLabels.length / 2;
                const horz = 2 * legendRectSize;
                const vert = i * height - offset;
                return "translate(" + horz + "," + vert + ")";
            });

        legends.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .style("fill", function (d, i) {
                return customColorScale(d);
            });

        legends.append("text")
            .attr("x", legendRectSize + legendSpacing)
            .attr("y", legendRectSize - legendSpacing)
            .text(function (d, i) {
                return formatLegendLabel(d);
            });

        // Function to generate dynamic legend labels
        function generateLegendLabels(maxValue) {
            const numSteps = 5; // You can adjust the number of steps in the legend
            const stepSize = maxValue / numSteps;
            const legendLabels = [];

            for (let i = 0; i <= numSteps; i++) {
                legendLabels.push(i * stepSize);
            }

            return legendLabels;
        }

        // Function to format legend labels
        function formatLegendLabel(value) {
            return value.toFixed(2); // You can adjust the number of decimal places
        }

        // Reset function
        function reset() {
            selectedState = null;
            g.selectAll(".feature").style("fill", function (d) {
                const stateName = d.properties.NAME;
                const total = processedTotal[stateName].Total;
                return d3.interpolateGnBu(total / maxTotal); // Reset colors based on the gradient
            });
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

        function clicked(event, d) {
            if (selectedState !== d) {
                reset();
                selectedState = d;
                d3.select(this).style("fill", "red");
                const [[x0, y0], [x1, y1]] = path.bounds(d);
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
    });
}

window.onload = init;