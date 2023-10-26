function init() {
    const width = 1000;
    const height = 600;
    const padding = 25;

    const color = d3.scaleOrdinal()
        .range(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);

    const projection = d3.geoMercator()
        .center([145, -36])
        .translate([width / 2, height / 2])
        .scale(5000);

    const path = d3.geoPath()
        .projection(projection);

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + padding)
        .attr("height", height + padding);

    // Load the unemployment data from CSV
    d3.csv("VIC_LGA_unemployment.csv", function (d) {
        return {
            LGA: d.LGA,
            unemployed: +d.unemployed
        };
    }).then(function (data) {
        // Load the VIC geographic data from JSON
        d3.json("LGA_VIC.json").then(function (json) {
            // Match data to features
            for (let i = 0; i < data.length; i++) {
                const dataState = data[i].LGA;
                const dataValue = parseFloat(data[i].unemployed);

                for (let j = 0; j < json.features.length; j++) {
                    const jsonState = json.features[j].properties.LGA_name;

                    if (dataState == jsonState) {
                        json.features[j].properties.value = dataValue;
                        break;
                    }
                }
            }

            // Draw map paths with colors
            const states = svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("stroke", "dimgray")
                .attr("fill", function (d, i) {
                    return color(i);
                })
                .attr("d", path);

            // Load Asian migration data
            d3.csv("asian_migration_data.csv", function (d) {
                return {
                    state: d['State of intended residence'],
                    total: +d['Total'],
                    china: +d['China'],
                    bangladesh: +d['Bangladesh'],
                    india: +d['India'],
                    iran: +d['Iran'],
                    korea: +d['Korea'],
                    pakistan: +d['Pakistan'],
                    philippines: +d['Philippines'],
                    taiwan: +d['Taiwan'],
                    vietnam: +d['Vietnam'],
                    other: +d['Other'],
                };
            }).then(function (migrationData) {
                // Display migration data upon state click
                states.on("click", function (event, d) {
                    const stateName = d.properties.LGA_name;
                    const migrationInfo = migrationData.find((item) => item.state === stateName);

                    if (migrationInfo) {
                        alert(`Migration Data for ${stateName}:\nTotal: ${migrationInfo.total}\nChina: ${migrationInfo.china}\nBangladesh: ${migrationInfo.bangladesh}\nIndia: ${migrationInfo.india}\nIran: ${migrationInfo.iran}\nKorea: ${migrationInfo.korea}\nPakistan: ${migrationInfo.pakistan}\nPhilippines: ${migrationInfo.philippines}\nTaiwan: ${migrationInfo.taiwan}\nVietnam: ${migrationInfo.vietnam}\nOther: ${migrationInfo.other}`);
                    } else {
                        alert(`No migration data available for ${stateName}`);
                    }
                });
            });

            // Load city data from CSV
            d3.csv("VIC_city.csv", function (d) {
                return {
                    place: d.place,
                    lat: +d.lat,
                    long: +d.lon
                };
            }).then(function (cityData) {
                // Draw circles for cities
                svg.selectAll("circle")
                    .data(cityData)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return projection([d.long, d.lat])[0];
                    })
                    .attr("cy", function (d) {
                        return projection([d.long, d.lat])[1];
                    })
                    .attr("r", 5)
                    .style("fill", d3.color("red"));

                // Display city names as text
                svg.selectAll("text")
                    .data(cityData)
                    .enter()
                    .append("text")
                    .attr("x", function (d) {
                        return projection([d.long, d.lat])[0];
                    })
                    .attr("y", function (d) {
                        return projection([d.long, d.lat])[1];
                    })
                    .style("fill", d3.color("black"))
                    .style("z-index", 1)
                    .text(function (d) {
                        return d.place;
                    });
            });
        });
    });
}

window.onload = init;