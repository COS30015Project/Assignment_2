// D3.js code
function init() {
  // Load data from CSV file
  d3.csv("BarChartDataset.csv").then(function (data) {
    // Set up variables
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
      .domain(data.map(d => d['Country Name']))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d['Total'])])
      .range([height, 0]);

    const bars = svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar total")
      .attr("x", d => x(d['Country Name']))
      .attr("width", x.bandwidth())
      .attr("y", d => y(+d['Total']))
      .attr("height", d => height - y(+d['Total']));

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

    bars.on("mouseover", function (event, d) {
      const gender = d3.select('input[name="gender"]:checked').node().value;
      const value = gender === 'total' ? +d['Total'] : gender === 'male' ? +d['Male'] : +d['Female'];

      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      tooltip.html(`<strong>${d['Country Name']}</strong><br>${gender}: ${value}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    d3.selectAll('input[name="gender"]').on("change", updateBars);

    function updateBars() {
      const gender = d3.select('input[name="gender"]:checked').node().value;
      bars.attr("class", d => `bar ${gender}`)
        .transition()
        .duration(500)
        .attr("y", d => y(+d[gender]))
        .attr("height", d => height - y(+d[gender]));
    }
  });
}

window.onload = init;
