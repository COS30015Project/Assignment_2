function init() {
    // Define the dimensions of the SVG canvas.
    const width = 800;
    const height = 600;
  
    // Define color scale for migration totals.
    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 30000]);
  
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
  
      // Load the US migration data CSV.
      d3.csv('us_migration_data.csv').then(function (migrationData) {
        // Group migration data by state and calculate total area.
        const stateAreas = {};
        migrationData.forEach(function (row) {
          stateAreas[row['US States']] = {
            totalArea: +row['Total'], // Convert to a number
          };
        });
  
        // Calculate the domain for the color scale.
        const maxTotal = d3.max(migrationData, (d) => +d['Total']);
        colorScale.domain([0, maxTotal]);
  
        // Bind the GeoJSON data to the SVG and draw the map with colored states.
        const statePaths = svg.selectAll('path')
          .data(usData.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', function (d) {
            const stateName = d.properties.NAME;
            const totalArea = stateAreas[stateName].totalArea;
            return colorScale(totalArea);
          })
          .attr('stroke', 'white');
  
        // Display the total area for each state on mouseover.
        statePaths.on('mouseover', function (d) {
          const stateName = d.properties.NAME;
          const totalArea = stateAreas[stateName].totalArea;
          d3.select(this).attr('fill', 'orange'); // Change color on mouseover
  
          // Display information in a tooltip box.
          d3.select('#tooltip')
            .style('display', 'block')
            .html(`State: ${stateName}<br>Total Migration: ${totalArea}`)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', function (d) {
            const stateName = d.properties.NAME;
            const totalArea = stateAreas[stateName].totalArea;
            return colorScale(totalArea);
          });
  
          // Hide the tooltip box on mouseout.
          d3.select('#tooltip').style('display', 'none');
        });
      });
    });
  }
  
  window.onload = init;
  