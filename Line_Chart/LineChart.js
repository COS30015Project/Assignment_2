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
      const height = 560 - margin.top - margin.bottom;
  
      // Create an SVG element
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Extract the data fields you need
      const years = data.columns.slice(2).map(year => parseInt(year)); // Parse years to integers
  
      // Generate a custom color scale with unique colors for each country
      const uniqueColors = data.map((d, i) => d3.interpolateSinebow(i / data.length)); // Use a color interpolation
      const colorScale = d3.scaleOrdinal(data.map(d => d['Asian Country']), uniqueColors);
  
      // Define the x and y scales
      const x = d3.scaleLinear() // Use a linear scale for the x-axis
        .domain([d3.min(years), d3.max(years)]) // Set the x-axis domain to the minimum and maximum years
        .range([0, width]);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(years.map(year => +d[year])))])
        .range([height, 0]);
  
      // Create a line generator
      const line = d3.line()
        .x((d, i) => x(years[i])) // Map years to x-axis values as integers
        .y(d => y(+d));
  
      // Create the lines with different colors
      svg.selectAll(".line")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(years.map(year => +d[year])))
        .style("fill", "none")
        .style("stroke", (d) => colorScale(d['Asian Country'])) // Use country name as a unique key
        .style("stroke-width", 2);
  
      // Add dots for each year
      const dots = svg
        .selectAll(".dot-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "dot-group");
  
      dots.selectAll("circle")
        .data((d) => years.map(year => ({ year, value: +d[year], name: d['Asian Country'] })))
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.value))
        .attr("r", 4)
        .style("fill", (d) => colorScale(d.name))
        .on("mouseover", (event, d) => {
          // Show tooltip on mouseover
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "8px")
            .html(`Country: ${d.name}<br>Year: ${d.year}<br>Value: ${d.value}`);
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => {
          // Remove tooltip on mouseout
          d3.select(".tooltip").remove();
        });
  
      // Add axes
      svg.append("g")
        .attr("class", "x-axis") // Add a class for the x-axis
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(years.length).tickFormat(d3.format("d"))); // Format x-axis labels as integers
  
      svg.append("g")
        .call(d3.axisLeft(y));
  
      // Add legend
      const legendContainer = d3.select("body").select(".legend-container");
  
      const legendItems = data.map((d) => {
        return {
          color: colorScale(d['Asian Country']),
          name: d['Asian Country'],
        };
      });
  
      const legends = legendContainer
        .selectAll(".legend-item")
        .data(legendItems)
        .enter()
        .append("div")
        .attr("class", "legend-item");
  
      legends
        .append("div")
        .style("background-color", (d) => d.color)
        .attr("class", "legend-color");
  
      legends
        .append("text")
        .text((d) => d.name);
    }
  }
  
  window.onload = init;
  