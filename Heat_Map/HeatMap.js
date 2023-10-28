function init() {
    // Define the dimensions of the SVG canvas.
    const width = 1200;
    const height = 1000;

    // Append an SVG element for the map to the body of the page.
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Append a separate tooltip element for displaying state information.
    const tooltip = d3.select('body') // Separate tooltip container
        .append('div')
        .attr('id', 'tooltip')
        .style('display', 'none')
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.8)')
        .style('padding', '8px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('pointer-events', 'none');

    // Load the US GeoJSON data.
    d3.json('usa.json').then(function (usData) {
        // Create a GeoProjection and path.
        const projection = d3.geoAlbersUsa();
        const path = d3.geoPath().projection(projection);

        // Bind the GeoJSON data to the SVG and draw the map.
        svg.selectAll('path')
            .data(usData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .on('mousemove', function (d) {
                if (d) { // Check if 'd' is defined
                    const stateName = d.properties.NAME;
                    tooltip.style('display', 'block');
                    tooltip.html(stateName);

                    // Update the tooltip's position.
                    const [x, y] = d3.mouse(this);
                    tooltip.style('left', x + 'px')
                        .style('top', y + 'px');
                }
            })
            .on('mouseout', function () {
                tooltip.style('display', 'none');
            });

        // Add an 'mousemove' event listener to the SVG container.
        svg.on('mousemove', function () {
            // Update the tooltip's position.
            const [x, y] = d3.mouse(this);
            tooltip.style('left', x + 'px')
                .style('top', y + 'px');
        });
    });
}

window.onload = init;
