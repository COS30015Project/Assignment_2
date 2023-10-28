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

            // Bind the GeoJSON data to the SVG and draw the map.
            svg.selectAll('path')
                .data(usData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'steelblue')
                .attr('stroke', 'white');
        });
    });
});