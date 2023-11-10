function init() {
  let data; // Define a global variable to hold the data

  // Load the data from the CSV file
  d3.csv("BarChartDataset.csv")
      .then(function (csvData) {
          data = csvData; // Store the loaded data in the global variable
          visualizeData(data);
      })
      .catch(function (error) {
          console.error("Error loading data:", error);
      });

  // Function to visualize the data
  function visualizeData(data) {
      // Define the dimensions and margins for the SVG
      const margin = { top: 30, right: 30, bottom: 80, left: 60 };
      const width = 1000 - margin.left - margin.right; // Increase the width
      const height = 1000 - margin.top - margin.bottom; // Increase the height

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
      const x = d3.scaleLinear()
          .domain([0, d3.max(data, d => d3.sum(countries, c => +d[c]))])
          .range([0, width]);

      const y = d3.scaleBand()
          .domain(states)
          .range([height, 0])
          .padding(0.1);

      // Create bars
      svg.selectAll(".bar-group")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "bar-group")
          .attr("transform", d => `translate(0, ${y(d['US States'])})`)
          .selectAll("rect")
          .data(d => countries.map(c => ({ country: c, value: +d[c] })))
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", d => y.bandwidth() / 4 * countries.indexOf(d.country))
          .attr("width", d => x(d.value))
          .attr("height", y.bandwidth() / 2)
          .attr("fill", d => colorScale(d.country));

      // Add axes
      svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`) // Move x-axis to the bottom
          .call(d3.axisBottom(x));

      svg.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y));
  }
}

window.onload = init;