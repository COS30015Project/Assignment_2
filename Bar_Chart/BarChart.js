function init() {
    var data;
    var width = 600;
    var height = 400;
    var margin = 50;

    d3.csv("BarChartDataset.csv").then(function (loadedData) {
      data = loadedData;

      // Extract the column names (categories)
      var categories = Object.keys(data[0]).slice(1);

      // Create the SVG element and add the chart title.
      var svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Process the data and convert the categorical values into numerical values.
      data.forEach(function (d) {
        categories.forEach(function (category) {
          d[category] = +d[category];
        });
      });

      // Create scales for x and y
      var x = d3
        .scaleLinear()
        .domain([0, d3.max(data, function (d) { return d3.max(categories, function (category) { return d[category]; }); })])
        .range([margin, width - margin]);

      var y = d3
        .scaleBand()
        .domain(data.map(function (d) { return d["US States"]; }))
        .range([height - margin, 0])
        .padding(0.2);

      // Create the bars
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", function (d) {
          return y(d["US States"]);
        })
        .attr("width", function (d) {
          return x(d3.max(categories, function (category) { return d[category]; })) - x(0);
        })
        .attr("height", y.bandwidth())
        .style("fill", "steelblue");

      // Add x-axis to the SVG element
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, " + (height - margin) + ")")
        .call(d3.axisBottom(x));

      // Add y-axis to the SVG element
      svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin + ", 0)")
        .call(d3.axisLeft(y));
    });
  }

  window.onload = init;