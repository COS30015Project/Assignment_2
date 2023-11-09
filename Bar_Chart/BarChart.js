function init() {
  var data;
  var width = 1000; // Adjusted width
  var height = 600; // Adjusted height
  var margin = { top: 30, right: 40, bottom: 70, left: 70 }; // Adjusted margins

  d3.csv("BarChartDataset.csv").then(function (loadedData) {
    data = loadedData;

    var categories = Object.keys(data[0]).slice(1);

    // Calculate the total for each US state
    data.forEach(function (d) {
      d.Total = d3.sum(categories, function (category) {
        return d[category];
      });
    });

    var svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var x = d3
      .scaleLinear()
      .domain([0, d3.max(data, function (d) {
        return d.Total;
      })])
      .range([margin.left, width - margin.right]);

    var y = d3
      .scaleBand()
      .domain(data.map(function (d) {
        return d["US States"];
      }))
      .range([height - margin.bottom, margin.top])
      .padding(0.2);

    var svgGroup = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgGroup.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", function (d) {
        return y(d["US States"]);
      })
      .attr("width", function (d) {
        return x(d.Total) - x(0);
      })
      .attr("height", y.bandwidth())
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    // Add x-axis to the SVG element
    svgGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

    // Add rotated y-axis to the SVG element
    svgGroup.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)");

    // X-axis label
    svg.append("text")
      .attr("x", width / 4)
      .attr("y", height - 10) // Adjusted y position
      .style("text-anchor", "middle")
      .text("Value");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10) // Adjusted y position
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("US States");

    function handleMouseOver(event, d) {
      // Show details when hovering over the bar
      d3.select(this).style("fill", "orange");
      var details = "Total: " + d.Total;
      tooltip.html(details).style("opacity", 1);
    }

    function handleMouseOut(event, d) {
      // Reset the bar color and hide details when not hovering
      d3.select(this).style("fill", "steelblue");
      tooltip.style("opacity", 0);
    }

    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  });
}

window.onload = init;
