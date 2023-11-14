// D3.js code
function init() {
  // Load data from CSV
d3.csv("BarChartDataset.csv").then(function(data) {
  // Set up SVG and dimensions
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d['Country Name']))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d['Total'])])
    .range([height, 0]);

  // Set up colors
  const colorScale = d3.scaleOrdinal()
    .domain(['total', 'male', 'female'])
    .range(['green', 'blue', 'pink']);

  // Draw bars
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d['Country Name']))
    .attr("y", d => yScale(+d['Total']))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(+d['Total']))
    .attr("fill", d => colorScale('total'));

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  // Add y-axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Add interactivity
  svg.selectAll(".bar")
    .on("mouseover", function(event, d) {
      const selectedClass = document.querySelector('input[name="class"]:checked').value;
      const tooltipText = `${d['Country Name']}: ${d[selectedClass]}`;
      
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      
      tooltip.html(tooltipText)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 28}px`);
      
      d3.select(this).attr("fill", colorScale(selectedClass));
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      
      const selectedClass = document.querySelector('input[name="class"]:checked').value;
      d3.select(this).attr("fill", colorScale(selectedClass));
    });

  // Update chart based on selected radio button
  d3.selectAll('input[name="class"]').on("change", function() {
    const selectedClass = this.value;

    svg.selectAll(".bar")
      .transition()
      .duration(500)
      .attr("fill", d => colorScale(selectedClass))
      .attr("y", d => yScale(+d[selectedClass]))
      .attr("height", d => height - yScale(+d[selectedClass]));

    // Update tooltip text
    svg.selectAll(".bar")
      .on("mouseover", function(event, d) {
        const tooltipText = `${d['Country Name']}: ${d[selectedClass]}`;
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        tooltip.html(tooltipText)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
        
        d3.select(this).attr("fill", colorScale(selectedClass));
      });
  });
});
}

window.onload = init;