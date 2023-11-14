// D3.js code
function init() {
 // Read the CSV file
d3.csv("BarChartDataset.csv").then(function(data) {
  // Create scales
  const x = d3.scaleBand()
     .domain(data.map(d => d["Country Name"]))
     .range([0, width])
     .padding(0.2);
 
  const y = d3.scaleLinear()
     .domain([0, d3.max(data, d => d["Total"])]).nice()
     .range([height, 0]);
 
  // Create tooltip
  const tooltip = d3.select("body")
     .append("div")
     .style("position", "absolute")
     .style("background", "#fff")
     .style("padding", "5px")
     .style("border", "1px solid #ccc")
     .style("border-radius", "4px")
     .style("visibility", "hidden");
 
  // Create chart
  const chart = d3.select("#chart")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
  // Add x-axis
  chart.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));
 
  // Add y-axis
  chart.append("g")
     .call(d3.axisLeft(y));
 
  // Add bars
  chart.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d["Country Name"]))
     .attr("y", d => y(d["Total"]))
     .attr("width", x.bandwidth())
     .attr("height", d => height - y(d["Total"]))
     .attr("fill", d => color(d["Class"]))
     .on("mouseover", function(d) {
         tooltip.style("visibility", "visible")
             .text(`Country: ${d["Country Name"]}\nValue: ${d["Total"]}`);
     })
     .on("mousemove", function() {
         tooltip.style("top", (d3.event.pageY - 10) + "px")
             .style("left", (d3.event.pageX + 10) + "px");
     })
     .on("mouseout", function() {
         tooltip.style("visibility", "hidden");
     });
 
  // Update bars on radio button change
  d3.selectAll("input[name='class']").on("change", function() {
     const selectedClass = this.value;
 
     chart.selectAll(".bar")
         .data(data)
         .transition()
         .duration(500)
         .attr("y", d => y(d[selectedClass]))
         .attr("height", d => height - margin.bottom - y(d[selectedClass]))
         .attr("fill", d => color(selectedClass));
  });
 });
}

window.onload = init;
