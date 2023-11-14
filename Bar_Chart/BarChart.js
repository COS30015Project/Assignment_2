// D3.js code
function init() {
    // Load data from CSV
d3.csv("BarChartDataset.csv").then(function(data) {
    // Convert string numbers to integers
    data.forEach(function(d) {
      d.Male = +d.Male;
      d.Female = +d.Female;
      d.Total = +d.Total;
    });
  
    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Create SVG container
    const svg = d3.select("#chart-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Initial class selection
    let selectedClass = "total";
  
    // Update chart based on selected class
    function updateChart() {
      const selectedData = data.map(d => ({ Country: d["Country Name"], Value: d[selectedClass] }));
  
      // Update scales
      const xScale = d3.scaleBand()
        .domain(selectedData.map(d => d.Country))
        .range([0, width])
        .padding(0.1);
  
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(selectedData, d => d.Value)])
        .range([height, 0]);
  
      // Update bars
      const bars = svg.selectAll(".bar")
        .data(selectedData, d => d.Country);
  
      bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Country))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.Value))
        .attr("height", d => height - yScale(d.Value))
        .attr("fill", d => selectedClass === "male" ? "blue" : (selectedClass === "female" ? "pink" : "green"))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
  
      bars.transition()
        .attr("x", d => xScale(d.Country))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.Value))
        .attr("height", d => height - yScale(d.Value))
        .attr("fill", d => selectedClass === "male" ? "blue" : (selectedClass === "female" ? "pink" : "green"));
  
      bars.exit().remove();
  
      // Update axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
  
      svg.select(".x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
  
      svg.select(".y-axis")
        .call(yAxis);
    }
  
    // Initialize chart
    updateChart();
  
    // Handle radio button change
    d3.selectAll("input[name='class']").on("change", function() {
      selectedClass = this.value;
      updateChart();
    });
  
    // Tooltip functions
    function showTooltip(event, d) {
      const tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("pointer-events", "none");
  
      tooltip.append("rect")
        .attr("fill", "white")
        .attr("width", 100)
        .attr("height", 40)
        .attr("x", event.x - 50)
        .attr("y", event.y - 50)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
  
      tooltip.append("text")
        .attr("x", event.x)
        .attr("y", event.y - 30)
        .attr("text-anchor", "middle")
        .text(`${d.Country}: ${d.Value}`);
    }
  
    function hideTooltip() {
      svg.select(".tooltip").remove();
    }
  });
  
}

window.onload = init;
