function init() {
  // Load the CSV data and create the line chart
  d3.csv("CurrencyData.csv")
    .then(function (data) {
      // Data preprocessing
      const parseDate = d3.timeParse("%Y");
      const columns = data.columns.slice(2); // Exclude the first two columns

      data.forEach(function (d) {
        for (const col of columns) {
          d[col] = parseFloat(d[col]);
        }
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
        .scaleTime()
        .domain([new Date(2000, 0, 1), new Date(2022, 0, 1)])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d3.max(columns.map((col) => d[col])))])
        .nice()
        .range([height, 0]);

      // Create line generator
      const line = d3
        .line()
        .x((d) => xScale(parseDate(d.Year)))
        .y((d) => yScale(d.Value));

      // Create a color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // Append a path for each country
      columns.forEach((col, i) => {
        svg
          .append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", color(i));
      });

      // Add x and y axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%Y")));

      svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

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
        .data(columns)
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
        .text((d) => d);
    })
    .catch(function (error) {
      console.log(error);
    });
}

window.onload = init;
