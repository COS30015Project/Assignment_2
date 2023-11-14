// D3.js code
function init() {
  d3.csv("BarChartDataset.csv").then(function (data) {
      // Set up SVG and chart dimensions
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3.select("#chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Parse data
      data.forEach(function (d) {
          d.Male = +d.Male;
          d.Female = +d.Female;
          d.Total = +d.Total;
      });

      // Initial class selection
      let selectedClass = "Total";

      // Create scales
      const xScale = d3.scaleBand()
          .domain(data.map(d => d["Country Name"]))
          .range([0, width])
          .padding(0.1);

      const yScale = d3.scaleLinear()
          .domain([0, d3.max(data, d => d[selectedClass])])
          .range([height, 0]);

      const colorScale = d3.scaleOrdinal()
          .domain(["Male", "Female", "Total"])
          .range(["blue", "pink", "green"]);

      // Create bars
      const bars = svg.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", d => xScale(d["Country Name"]))
          .attr("y", d => yScale(d[selectedClass]))
          .attr("width", xScale.bandwidth())
          .attr("height", d => height - yScale(d[selectedClass]))
          .attr("class", "bar")
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut);

      // Create axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .call(yAxis);

      // Add radio buttons
      d3.selectAll("input[name='gender']")
          .on("change", updateChart);

      function updateChart() {
          selectedClass = this.value;

          // Update scales
          yScale.domain([0, d3.max(data, d => d[selectedClass])]);

          // Update bars
          bars.transition()
              .duration(500)
              .attr("y", d => yScale(d[selectedClass]))
              .attr("height", d => height - yScale(d[selectedClass]))
              .attr("fill", colorScale(selectedClass));
      }

      // Tooltip functions
      function handleMouseOver(event, d) {
          const tooltip = d3.select("#chart").append("div")
              .attr("class", "tooltip")
              .style("opacity", 0);

          tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);

          tooltip.html(
              `<strong>${d["Country Name"]}</strong><br/>${selectedClass}: ${d[selectedClass]}`
          )
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
      }

      function handleMouseOut() {
          d3.select(".tooltip").transition()
              .duration(500)
              .style("opacity", 0)
              .remove();
      }
  });
}

window.onload = init;
