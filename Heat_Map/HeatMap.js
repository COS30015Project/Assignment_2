document.addEventListener('DOMContentLoaded', function () {
    // Define the dimensions of the SVG canvas.
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
        // Bind the GeoJSON data to the SVG and draw the map.
        svg.selectAll('path')
            .data(usData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'none') // Set the fill to 'none' for the map
            .attr('stroke', 'white')
            .attr('stroke-width', 1); // Add a stroke for state boundaries

        // Simulated data for state circles (replace with your data)
        const stateData = [
            { state: 'Alabama', value: 50 },
            { state: 'Alaska', value: 30 },
            // Add data for other states
        ];

        // Create a dictionary to map state names to their data.
        const processedData = {};
        stateData.forEach(function (d) {
            processedData[d.state] = d.value;
        });

        // Add dots to the map using your processed data.
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
            .attr('r', 5) // Adjust the radius as needed
            .attr('fill', 'blue'); // Set the fill for the circles to 'blue'

        // Create an update function to change the radius of dots.
        function update(value) {
            svg.selectAll('circle')
                .attr('r', function (d) {
                    return processedData[d] || 0;
                });
        }

        // You can call the update function when needed.
        update('value'); // Example: Change the radius based on 'value' data.
    });
});
