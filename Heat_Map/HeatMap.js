function init() {
    const width = 1000;
    const height = 800;

    var colorArray = [ "#0d0887","#100788","#130789","#16078a","#19068c","#1b068d","#1d068e","#20068f","#220690","#240691","#260591","#280592","#2a0593","#2c0594","#2e0595","#2f0596","#310597","#330597","#350498","#370499","#38049a","#3a049a","#3c049b","#3e049c","#3f049c","#41049d","#43039e","#44039e","#46039f","#48039f","#4903a0","#4b03a1","#4c02a1","#4e02a2","#5002a2","#5102a3","#5302a3","#5502a4","#5601a4","#5801a4","#5901a5","#5b01a5","#5c01a6","#5e01a6","#6001a6","#6100a7","#6300a7","#6400a7","#6600a7","#6700a8","#6900a8","#6a00a8","#6c00a8","#6e00a8","#6f00a8","#7100a8","#7201a8","#7401a8","#7501a8","#7701a8","#7801a8","#7a02a8","#7b02a8","#7d03a8","#7e03a8","#8004a8","#8104a7","#8305a7","#8405a7","#8606a6","#8707a6","#8808a6","#8a09a5","#8b0aa5","#8d0ba5","#8e0ca4","#8f0da4","#910ea3","#920fa3","#9410a2","#9511a1","#9613a1","#9814a0","#99159f","#9a169f","#9c179e","#9d189d","#9e199d","#a01a9c","#a11b9b","#a21d9a","#a31e9a","#a51f99","#a62098","#a72197","#a82296","#aa2395","#ab2494","#ac2694","#ad2793","#ae2892","#b02991","#b12a90","#b22b8f","#b32c8e","#b42e8d","#b52f8c","#b6308b","#b7318a","#b83289","#ba3388","#bb3488","#bc3587","#bd3786","#be3885","#bf3984","#c03a83","#c13b82","#c23c81","#c33d80","#c43e7f","#c5407e","#c6417d","#c7427c","#c8437b","#c9447a","#ca457a","#cb4679","#cc4778","#cc4977","#cd4a76","#ce4b75","#cf4c74","#d04d73","#d14e72","#d24f71","#d35171","#d45270","#d5536f","#d5546e","#d6556d","#d7566c","#d8576b","#d9586a","#da5a6a","#da5b69","#db5c68","#dc5d67","#dd5e66","#de5f65","#de6164","#df6263","#e06363","#e16462","#e26561","#e26660","#e3685f","#e4695e","#e56a5d","#e56b5d","#e66c5c","#e76e5b","#e76f5a","#e87059","#e97158","#e97257","#ea7457","#eb7556","#eb7655","#ec7754","#ed7953","#ed7a52","#ee7b51","#ef7c51","#ef7e50","#f07f4f","#f0804e","#f1814d","#f1834c","#f2844b","#f3854b","#f3874a","#f48849","#f48948","#f58b47","#f58c46","#f68d45","#f68f44","#f79044","#f79143","#f79342","#f89441","#f89540","#f9973f","#f9983e","#f99a3e","#fa9b3d","#fa9c3c","#fa9e3b","#fb9f3a","#fba139","#fba238","#fca338","#fca537","#fca636","#fca835","#fca934","#fdab33","#fdac33","#fdae32","#fdaf31","#fdb130","#fdb22f","#fdb42f","#fdb52e","#feb72d","#feb82c","#feba2c","#febb2b","#febd2a","#febe2a","#fec029","#fdc229","#fdc328","#fdc527","#fdc627","#fdc827","#fdca26","#fdcb26","#fccd25","#fcce25","#fcd025","#fcd225","#fbd324","#fbd524","#fbd724","#fad824","#fada24","#f9dc24","#f9dd25","#f8df25","#f8e125","#f7e225","#f7e425","#f6e626","#f6e826","#f5e926","#f5eb27","#f4ed27","#f3ee27","#f3f027","#f2f227","#f1f426","#f1f525","#f0f724","#f0f921" ];

    // Use a custom color scale
    const colorScale = d3.scaleQuantize() 
    .domain([0, maxTotal])
    .range(colorArray);

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
                return colorScale(total);
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
            selectedState = null;
            g.selectAll(".feature").style("fill", function (d) {
                const stateName = d.properties.NAME;
                const total = processedTotal[stateName].Total;
                return colorScale(total);
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
