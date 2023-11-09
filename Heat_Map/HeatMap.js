function init() {
    const width = 1000;
    const height = 800;

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
            .style("position", "absolute");

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
                return d3.interpolateGnBu(total / maxTotal);
            })
            .on("click", clicked)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // Create a horizontal legend
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width - 220}, ${height - 40})`);

        const legendWidth = 200;
        const legendHeight = 18;

        const legendScale = d3.scaleLinear()
            .domain([0, maxTotal])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickValues(d3.range(0, maxTotal, maxTotal / 4));

        // Create a linear gradient for the legend
        const defs = svg.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "colorGradient")
            .attr("x1", "0%")
            .attr("x2", "100%");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", d3.interpolateGnBu(0));

        linearGradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", d3.interpolateGnBu(1));

        legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#colorGradient");

        legendGroup.append("g")
            .attr("class", "legend-axis")
            .call(legendAxis);

        // Reset function
        function reset() {
            if (selectedState) {
                d3.select(selectedState)
                    .style("fill", function (d) {
                        const stateName = d.properties.NAME;
                        const total = processedTotal[stateName].Total;
                        return d3.interpolateGnBu(total / maxTotal);
                    });
                selectedState = null;
            }
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

        function clicked(event, d) {
            if (selectedState !== d) {
                reset();
                selectedState = this;
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
