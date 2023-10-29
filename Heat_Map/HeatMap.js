function init()
{

    // Define the dimensions of the SVG canvas.
const width = 1200;
const height = 1000;

// Append an SVG element to the body of the page.
const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Create a div element for displaying data
const div = d3.select('body').append('div')
    .attr('class', 'info-box')
    .style('opacity', 0);

// Build color scale
const myColor = d3.scaleLinear()
    .range(["white", "#69b3a2"])
    .domain([1, 100]);

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

        svg.selectAll('path')
            .data(usData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .on('mouseover', function (d) {
                // Get the data for the hovered state
                const stateData = processedData[d.properties.name];

                // Display data in the div element
                div.style('opacity', 0.9);
                div.html('<b>' + d.properties.name + '</b><br>' +
                    'Bangladesh: ' + stateData.Bangladesh + '<br>' +
                    'China: ' + stateData.China + '<br>' +
                    'India: ' + stateData.India + '<br>' +
                    'Iran: ' + stateData.Iran + '<br>' +
                    'Korea: ' + stateData.Korea + '<br>' +
                    'Pakistan: ' + stateData.Pakistan + '<br>' +
                    'Philippines: ' + stateData.Philippines + '<br>' +
                    'Taiwan: ' + stateData.Taiwan + '<br>' +
                    'Vietnam: ' + stateData.Vietnam + '<br>' +
                    'Others: ' + stateData.Others + '<br>' +
                    'Total: ' + stateData.Total)
                    .style('left', (d3.event.pageX + 23) + 'px')
                    .style('top', (d3.event.pageY - 20) + 'px');
            })
            .on('mouseout', function () {
                // Hide the div element on mouseout
                div.style('opacity', 0);
            });
    });
});

}

window.onload = init;