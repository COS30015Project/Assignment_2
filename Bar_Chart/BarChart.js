function init() {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 }; // Increased left margin for y-axis labels
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const colorScale = {
      "Male": "blue",
      "Female": "pink",
      "Total": "green"
  };

  d3.csv("BarChartDataset.csv").then(function (data) {
      const x = d3.scaleBand()
          .domain(data.map(d => d["Country Name"]))
          .range([0, width])
          .padding(0.2);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => +d["Total"])])
          .nice()
          .range([height, 0]);

      const tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("padding", "10px")
          .style("border", "1px solid #ccc")
          .style("border-radius", "4px")
          .style("visibility", "hidden");

      const chart = d3.select("#chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      chart.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      chart.append("g")
          .call(d3.axisLeft(y));

      const bars = chart.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d["Country Name"]))
          .attr("width", x.bandwidth())
          .attr("y", d => y(+d["Total"]))
          .attr("height", d => height - y(+d["Total"]))
          .attr("fill", d => colorScale["Total"]) // Default color for Total
          .on("mouseover", function (event, d) {
              tooltip.style("visibility", "visible")
                  .html(`Country: <strong>${d["Country Name"]}</strong><br>Value: <strong>${getTooltipText(d)}</strong>`)
                  .style("top", (event.pageY - 10) + "px")
                  .style("left", (event.pageX + 10) + "px");
          })
          .on("mousemove", function (event, d) {
              tooltip.style("top", (event.pageY - 10) + "px")
                  .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", function () {
              tooltip.style("visibility", "hidden");
          });

      // Update bars and colors on radio button change
      d3.selectAll("input[name='class']").on("change", function () {
          const selectedClass = this.value;

          bars.transition()
              .duration(500)
              .attr("y", d => y(+d[selectedClass]))
              .attr("height", d => height - y(+d[selectedClass]))
              .attr("fill", d => colorScale[selectedClass]);
      });

      // Set "Total" radio button as default
      d3.select("input[value='Total']").property("checked", true);
  });

  function getTooltipText(d) {
      const selectedClass = d3.select("input[name='class']:checked").node().value;
      return selectedClass === "Male" ? d["Male"] :
             selectedClass === "Female" ? d["Female"] :
             d["Total"];
  }
}

window.onload = init;
