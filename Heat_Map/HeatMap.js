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

    // create a tooltip
  var Tooltip = d3.select("#chart")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  Tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1)
}
var mousemove = function(d) {
  Tooltip
    .html("The exact value of<br>this cell is: " + d.value)
    .style("left", (d3.mouse(this)[0]+70) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
  Tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

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
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            /*.text(function (d) {
                const stateName = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);
                return stateName + "\n" + formattedData;
            })*/;

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
