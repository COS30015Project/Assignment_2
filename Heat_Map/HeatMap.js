function init() {
    const width = 1200;
    const height = 1000;
    const padding = 25;

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
        .attr("width", width + padding)
        .attr("height", height + padding);

    const g = svg.append("g");

    const color = d3.scaleOrdinal().range(colorScheme);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    const totalByState = new Map(); // Create a map to store the Asian migration data by state

    // Load the U.S. state GeoJSON data
    d3.json("usa.json").then(function (usData) {
        // Load the Asian migration data CSV
        d3.csv("data.csv").then(function (asianData) {
            asianData.forEach(function (d) {
                const stateName = d['State of intended residence'];
                const totalMigrants = +d['Total'];
                totalByState.set(stateName, d);
            });

            const states = g.append("g")
                .attr("fill", "#444")
                .attr("cursor", "pointer")
                .selectAll("path")
                .data(usData.features)
                .join("path")
                .on("click", clicked)
                .attr("d", path);

            states.append("title")
                .text(function (d) {
                    const stateName = d.properties.NAME;
                    const migrationData = totalByState.get(stateName);
                    return migrationData ? `${stateName}:\nTotal: ${migrationData.Total}\nChina: ${migrationData.China}\nBangladesh: ${migrationData.Bangladesh}\nIndia: ${migrationData.India}\nIran: ${migrationData.Iran}\nKorea: ${migrationData.Korea}\nPakistan: ${migrationData.Pakistan}\nPhilippines: ${migrationData.Philippines}\nTaiwan: ${migrationData.Taiwan}\nVietnam: ${migrationData.Vietnam}\nOther: ${migrationData.Other}` : `${stateName}: No data available`;
                });

            g.append("path")
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-linejoin", "round")
                .attr("d", path(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b)));

            function reset() {
                states.transition().style("fill", null);
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                );
            }

            function clicked(event, d) {
                const [[x0, y0], [x1, y1]] = path.bounds(d);
                event.stopPropagation();
                reset();
                d3.select(this).transition().style("fill", "red");
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.pointer(event, svg.node())
                );
            }

            function zoomed(event) {
                const { transform } = event;
                g.attr("transform", transform);
                g.attr("stroke-width", 1 / transform.k);
            }
        });
    });
}

window.onload = init;