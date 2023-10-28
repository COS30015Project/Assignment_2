function init() {
    // Define the dimensions of the SVG canvas.
    const width = 800;
    const height = 600;
  
    // Append an SVG element to the body of the page.
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    // Create a tooltip element for displaying state information.
    const tooltip = d3.select('#chart')
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
        .on('mouseover', function (d) {
          const stateName = d.properties.NAME;
          tooltip.style('display', 'block');
          tooltip.html(stateName); // Modify this line to display the desired information
        })
        .on('mouseout', function () {
          tooltip.style('display', 'none');
        });
    });
  }
  
  window.onload = init;
  