function init()
{

// Define the dimensions of the SVG canvas.
const width = 800;
const height = 600;

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
    .attr('fill', 'steelblue')
    .attr('stroke', 'white');

  // Load the US migration data CSV.
  d3.csv('us_migration_data.csv').then(function (migrationData) {
    // Group migration data by state and calculate total area.
    const stateAreas = {};
    migrationData.forEach(function (row) {
      stateAreas[row['US States']] = {
        totalArea: row['Total'],
      };
    });

    // Display the total area for each state.
    svg.selectAll('text')
      .data(usData.features)
      .enter()
      .append('text')
      .attr('x', function (d) {
        return path.centroid(d)[0];
      })
      .attr('y', function (d) {
        return path.centroid(d)[1];
      })
      .text(function (d) {
        const stateName = d.properties.NAME;
        return `State: ${stateName}, Area: ${stateAreas[stateName].totalArea}`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'black');
  });
});


}

window.onload = init;