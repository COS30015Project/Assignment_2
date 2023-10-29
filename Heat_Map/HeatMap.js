function init() {
    const width = 1200;
    const height = 1000;

    // Append an SVG element to the body of the page.
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define your projection and path.
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath().projection(projection);

    // Load the US GeoJSON data.
    d3.json('usa.json').then(function (usData) {
        // Add an initial projection of the USA.
        projection.fitSize([width, height], usData);

        // Load the US migration data from CSV.
        d3.csv('us_migration_data.csv').then(function (migrationData) {
            // Create a dictionary to map state names to their migration total.
            const processedData = {};
            migrationData.forEach(function (d) {
                processedData[d['US States']] = +d.Total;
            });

            // Draw the map.
            svg.selectAll('path')
                .data(usData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', 'white')
                .attr('stroke-width', 1);

            // Draw circle dots based on migration total.
            svg.selectAll('circle')
                .data(Object.keys(processedData))
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    const feature = usData.features.find(feature => feature.properties.name === d);
                    return feature ? projection(path.centroid(feature)[0]) : 0;
                })
                .attr('cy', function (d) {
                    const feature = usData.features.find(feature => feature.properties.name === d);
                    return feature ? projection(path.centroid(feature)[1]) : 0;
                })
                .attr('r', function (d) {
                    return processedData[d] || 0;
                })
                .attr('fill', 'blue');
        });
    });
}

window.onload = init;
