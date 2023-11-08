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
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract years and country names from the data
    const years = Object.keys(data[0]).slice(2);
    const countries = data.map(d => d['Asian Country']);

    // Define the color scale for lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Define the x and y scales
    const x = d3.scaleLinear()
      .domain([2000, 2022])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(years.map(year => +d[year])))])
      .range([height, 0]);

    // Create a line generator
    const line = d3.line()
      .x((d, i) => x(2000 + i))
      .y(d => y(d));

    // Create the lines with different colors
    svg.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", d => line(years.map(year => +d[year])))
      .style("fill", "none")
      .style("stroke", (d, i) => colorScale(i))
      .style("stroke-width", 2); // Increase the line width

    // Create the dots with tooltips
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .selectAll("circle")
      .data((d, i) => years.map(year => ({ year: 2000 + i, value: +d[year] })))
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 6) // Increase the dot size
      .style("fill", "red")
      .style("stroke", "white")
      .style("stroke-width", 2) // Add a white border
      .on("mouseover", (event, d) => {
        // Show tooltip on hover
        tooltip.style("visibility", "visible")
          .html(`Year: ${d.year}<br>Value: ${d.value}`);
      })
      .on("mousemove", (event) => {
        // Position the tooltip near the mouse pointer
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", () => {
        // Hide tooltip on mouseout
        tooltip.style("visibility", "hidden");
      });

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format x-axis labels as integers

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add labels to the lines
    svg.selectAll(".line-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "line-label")
      .attr("x", width)
      .attr("y", (d, i) => y(+d[years[years.length - 1]]))
      .text(d => d['Asian Country'])
      .style("fill", (d, i) => colorScale(i))
      .attr("dy", "0.35em")
      .attr("dx", "0.5em")
      .attr("font-size", "12px");

    // Add a tooltip element
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("visibility", "hidden");
  }
}

window.onload = init;
