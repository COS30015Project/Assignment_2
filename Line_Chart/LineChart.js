function init() {
  // Load the CSV data and create the line chart
  d3.csv("CurrencyData.csv")
    .then(function (data) {
      // Data preprocessing
      const parseDate = d3.timeParse("%Y");

      // Define the years (from 2000 to 2022) based on the CSV data
      const years = d3.range(2000, 2022);

      data.forEach(function (d) {
        // Extract Asian Country and Unit of Measure
        const country = d["Asian Country"];
        const unitOfMeasure = d["Unit of Measure"];

        // Create an array of objects for each year with year and value properties
        d.values = years.map((year) => ({
          year: year,
          value: parseFloat(d[year].replace(/,/g, "")), // Remove commas and convert to float
        }));

        d["Asian Country"] = country;
        d["Unit of Measure"] = unitOfMeasure;
      });

      // Set up the chart dimensions
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Create an SVG element
      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const xScale = d3
        .scaleLinear()
        .domain([2000, 2022])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d3.max(d.values, (v) => v.value))])
        .range([height, 0]);

      // Create line generator
      const line = d3
        .line()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.value));

      // Create a color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // Append circles for data points
      data.forEach((d, i) => {
        svg
          .selectAll("dot")
          .data(d.values)
          .enter()
          .append("circle")
          .attr("r", 5)
          .attr("cx", (d) => xScale(d.year))
          .attr("cy", (d) => yScale(d.value))
          .style("fill", color(i));
      });

      // Append a path for each country with no visible stroke
      data.forEach((d, i) => {
        svg
          .append("path")
          .datum(d.values)
          .attr("class", "line")
          .attr("d", line);
      });

      // Add x and y axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")));

      svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

      // Add chart title
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Exchange Rates to USD Over Time");

      // Add legend
      const legend = svg
        .selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

      legend
        .append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => color(i));

      legend
        .append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text((d) => d["Asian Country"]);
    })
    .catch(function (error) {
      console.log(error);
    });
}

window.onload = init;
