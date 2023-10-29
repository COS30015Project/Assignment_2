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

            // Create a GeoProjection and path.
            const projection = d3.geoAlbersUsa();
            const path = d3.geoPath().projection(projection);

            // Define a scale for the circle size based on the Total migration.
            const circleScale = d3.scaleSqrt()
                .domain([0, d3.max(csvData, d => +d.Total)]) // Adjust the domain as needed
                .range([0, 20]); // Adjust the range for the circle size

            // Bind the GeoJSON data to the SVG and draw the map.
            svg.selectAll('path')
                .data(usData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'steelblue')
                .attr('stroke', 'white')
                .on('mouseover', function (event, d) {
                    // Get the state name and total migration data if available.
                    const stateName = d.properties.name;
                    const totalMigration = processedData[stateName] ? processedData[stateName].Total : 0; // Default to 0 if state not found

                    // Calculate the circle position using the projection.
                    const [x, y] = path.centroid(d);

                    // Append a black circle with a transition for the pop-out effect.
                    svg.append('circle')
                        .attr('cx', x)
                        .attr('cy', y)
                        .attr('r', 0) // Start with a radius of 0
                        .attr('fill', 'black')
                        .transition()
                        .duration(500) // Adjust the duration as needed
                        .attr('r', circleScale(totalMigration)); // Scale the circle based on total migration
                })
                .on('mouseout', function () {
                    // Remove the circle on mouseout.
                    svg.select('circle').remove();
                });
        });
    });
});
