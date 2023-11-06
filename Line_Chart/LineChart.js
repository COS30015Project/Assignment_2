function init()
{

// Load the CSV data and create the line chart
d3.csv("Line_Chart.csv")
  .then(function(data) {
    // Data preprocessing
    const parseDate = d3.timeParse("%Y");
    data.forEach(function(d) {
      d["Exchange rate to USD (2023)"] = parseFloat(d["Exchange rate to USD (2023)"].replace(/[^0-9.-]+/g, ""));
      d["Exchange rate to USD (2022)"] = parseFloat(d["Exchange rate to USD (2022)"].replace(/[^0-9.-]+/g, ""));
      d["Exchange rate to USD (2021)"] = parseFloat(d["Exchange rate to USD (2021)"].replace(/[^0-9.-]+/g, ""));
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
      .domain([2021, 2022, 2023])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d3.max([d["Exchange rate to USD (2021)"], d["Exchange rate to USD (2022)"], d["Exchange rate to USD (2023)"]]))])
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line()
      .x((d) => xScale(parseDate(d.year)))
      .y((d) => yScale(d.value));

    // Create a color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Nest the data by country
    const nestedData = d3.groups(data, (d) => d.Country);

    // Append a path and circles for each country
    nestedData.forEach((countryData, i) => {
      svg
        .append("path")
        .datum(countryData[1])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", color(i));

      svg
        .selectAll("dot")
        .data(countryData[1])
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", (d) => xScale(parseDate(d.year)))
        .attr("cy", (d) => yScale(d.value))
        .style("fill", color(i));
    });

    // Add x and y axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(3).tickFormat(d3.format("d")));

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
      .data(nestedData)
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
      .text((d) => d[0]);
  })
  .catch(function(error) {
    console.log(error);
  });



}

window.onload = init;