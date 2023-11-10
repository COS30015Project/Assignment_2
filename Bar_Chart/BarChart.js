function init() {
  let data; // Define a global variable to hold the data

  // Load the data from the CSV file
  d3.csv("BarChartDataset.csv")
    .then(function(csvData) {
      data = csvData; // Store the loaded data in the global variable
      visualizeData(data);
    })
    .catch(function(error) {
      console.error("Error loading data:", error);
    });

  // Function to visualize the data
  function visualizeData(data) {
    // Define the dimensions and margins for the SVG
    const margin = { top: 30, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 560 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract US state names from the dataset
    const states = data.map(d => d['US States']);

    // Extract country names from the headers
    const countries = data.columns.slice(1);

    // Define color scale
    const colorScale = d3.scaleOrdinal()
      .domain(countries)
      .range(d3.schemeCategory10);

    // Define x and y scales
    const x = d3.scaleBand()
      .domain(states)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(countries, c => +d[c]))])
      .range([height, 0]);

    // Create bars
    svg.selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x(d['US States'])}, 0)`)
      .selectAll("rect")
      .data(d => countries.map(c => ({ country: c, value: +d[c] })))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x.bandwidth() / 4 * countries.indexOf(d.country))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => height - y(d.value))
      .attr("fill", d => colorScale(d.country));

    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", colorScale);

    legendItems.append("text")
      .text(d => d)
      .attr("x", 20)
      .attr("y", 10);

  }
}

window.onload = init;
