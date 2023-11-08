function init() {
  // Load the data from the CSV file
  d3.csv("CurrencyData.csv")
    .then(function(data) {
      visualizeData(data);
    })
    .catch(function(error) {
      console.error("Error loading data:", error);
    });

  // Function to visualize the data
  function visualizeData(data) {
    // Define the dimensions and margins for the SVG
    const margin = { top: 30, right: 30, bottom: 80, left: 60 }; // Increased margin for legend
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract the data fields you need
    const years = data.columns.slice(2).map(year => parseInt(year)); // Parse years to integers

    // Define the color scale for lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Define the x and y scales
    const x = d3.scaleLinear()
      .domain([2000, 2022]) // Set the x-axis domain to the desired range
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(years.map(year => +d[year])))])
      .range([height, 0]);

    // Create a line generator
    const line = d3.line()
      .x((d, i) => x(years[i])) // Map years to x-axis values
      .y(d => y(+d));

    // Create the lines with different colors
    svg.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", d => line(years.map(year => +d[year])))
      .style("fill", "none")
      .style("stroke", (d, i) => colorScale(i))
      .style("stroke-width", 2);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format x-axis labels as integers

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, ${height + 20})`);

    const legendItems = data.map((d, i) => {
      return {
        color: colorScale(i),
        name: d['Asian Country'],
      };
    });

    legend.selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 120}, 0)`);

    legend.selectAll(".legend-item")
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", d => d.color);

    legend.selectAll(".legend-item")
      .append("text")
      .attr("x", 30)
      .attr("y", 10)
      .text(d => d.name);
  }
}

window.onload = init;
