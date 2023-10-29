document.addEventListener('DOMContentLoaded', function () {
    // Define the dimensions of the SVG canvas.
    const width = 1200;
    const height = 1000;

    // Append an SVG element to the body of the page.
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

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
            .attr('fill', 'none') // Set the fill to 'none' for the map
            .attr('stroke', 'white')
            .attr('stroke-width', 1); // Add a stroke for state boundaries

        // Load the US state data from the CSV.
        d3.csv('us_migration_data.csv').then(function (data) {
            const csvData = data.slice(1); // Skip the first object (contains column names)

            // Create a dictionary to map state names to their data.
            const processedData = {};
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
                    Total: +d.Total
                };
            });

            // Add dots to the map using your processed data.
            svg.selectAll('circle')
                .data(Object.keys(processedData)) // Use the state names from your data
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    // Use projection to set the x-coordinate
                    const feature = usData.features.find(feature => feature.properties.name === d);
                    return feature ? projection(feature.geometry.coordinates[0]) : 0;
                })
                .attr('cy', function (d) {
                    // Use projection to set the y-coordinate
                    const feature = usData.features.find(feature => feature.properties.name === d);
                    return feature ? projection(feature.geometry.coordinates[1]) : 0;
                })
                .attr('r', 3) // You can adjust the radius as needed
                .attr('fill', 'blue'); // Set the fill for the circles to 'blue'

            // Create an update function to change the radius of dots.
            function update(date) {
                svg.selectAll('circle')
                    .attr('r', function (d) {
                        // You can use processedData to adjust the radius based on the selected date.
                        return processedData[d][date] || 0; // Add a default value or handle undefined cases.
                    });
            }

            // You can call the update function when needed.
            update('Total'); // Example: Change the radius based on 'Total' data.
        });
    });
});
