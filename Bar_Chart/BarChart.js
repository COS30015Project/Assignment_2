function init() {
    // Read the CSV file and create the chart
    d3.csv('BarChartDataset.csv').then(data => {
      // Extract data
      const countries = data.map(d => d['Country Name']);
      const maleValues = data.map(d => +d['Male']);
      const femaleValues = data.map(d => +d['Female']);
  
      // Set up chart dimensions
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
  
      // Create SVG container
      const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      // Create scales
      const xScale = d3.scaleBand()
        .domain(countries)
        .range([0, width])
        .padding(0.1);
  
      const yScale = d3.scaleLinear()
        .domain([0, d3.max([...maleValues, ...femaleValues])])
        .range([height, 0]);
  
      // Create color scale
      const colorScale = d3.scaleOrdinal()
        .domain(['Male', 'Female'])
        .range(['blue', 'pink']); // You can customize colors as needed
  
      // Create bars
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d['Country Name']))
        .attr('y', d => yScale(d['Total']))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d['Total']))
        .attr('fill', (d, i) => colorScale('Male')); // Use 'Male' color for maleValues
  
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d['Country Name']))
        .attr('y', d => yScale(d['Total'] - d['Male'])) // Adjust y position for femaleValues
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d['Total']))
        .attr('fill', (d, i) => colorScale('Female')); // Use 'Female' color for femaleValues
  
      // Create X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
  
      // Create Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale));
  
    });
  }
  
  window.onload = init;