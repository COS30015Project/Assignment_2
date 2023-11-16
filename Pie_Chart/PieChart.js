function init() {
    // Load the CSV file and create the pie chart
    d3.csv("PieChart.csv").then(function(data) {
      // Extract column headers (countries)
      const countries = Object.keys(data[0]).slice(0, -1);
  
      // Extract values for each country
      const values = data.map(d => countries.map(country => +d[country]));
  
      // Create color scale for countries
      const colorScale = d3.scaleOrdinal()
        .domain(countries)
        .range(d3.schemeCategory10);
  
      // Set up the pie chart layout
      const pie = d3.pie();
  
      // Set up the arc generator
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(100);
  
      // Create SVG container for the pie chart
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", 300)
        .attr("height", 300)
        .append("g")
        .attr("transform", "translate(150,150)");
  
      // Generate arcs and bind data
      const arcs = svg.selectAll("path")
        .data(pie(values[0]))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colorScale(countries[i]))
        .on("mouseover", function (event, d) {
          const total = d3.sum(values[0]);
          const percentage = ((d.data / total) * 100).toFixed(2);
          d3.select("#tooltip")
            .html(`${d.data} (${percentage}%)`)
            .style("opacity", 1)
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("opacity", 0);
        });
  
      // Create legend
      const legend = d3.select("#legend")
        .selectAll(".legend-item")
        .data(countries)
        .enter()
        .append("div")
        .attr("class", "legend-item");
  
      legend.append("span")
        .style("background-color", d => colorScale(d));
  
      legend.append("p")
        .text(d => d);
    });
  }
  
  window.onload = init;
  