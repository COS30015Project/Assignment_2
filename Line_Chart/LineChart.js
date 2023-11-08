function init() {
  // Load the data from the CSV file
  d3.csv("CurrencyData.csv")
      .then(function(data) {
          visualizeData(data);
      })
      .catch(function(error) {
          console.error("Error loading data:", error);
      });

  // Function to visualize the data
  function visualizeData(data) {
      // Define the dimensions and margins for the SVG
      const margin = { top: 30, right: 30, bottom: 30, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Create an SVG element
      const svg = d3.select("#chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define the x and y scales
      const x = d3.scaleLinear()
          .domain([2000, 2022]) // Adjust the domain according to your data
          .range([0, width]);

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d3.max(Object.values(d).slice(2)))])
          .range([height, 0]);

      // Create a line generator
      const line = d3.line()
          .x(d => x(+d.year))
          .y(d => y(+Object.values(d).slice(2)));

      // Create the lines
      svg.selectAll(".line")
          .data(data)
          .enter()
          .append("path")
          .attr("class", "line")
          .attr("d", d => line(data))
          .style("fill", "none")
          .style("stroke", "blue"); // Change the line color as needed

      // Create the dots
      svg.selectAll(".dot")
          .data(data)
          .enter()
          .selectAll("circle")
          .data(d => data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => x(+d.year))
          .attr("cy", d => y(+Object.values(d).slice(2)))
          .attr("r", 4)
          .style("fill", "red"); // Change the dot color as needed

      // Add axes
      svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

      svg.append("g")
          .call(d3.axisLeft(y));
  }
}

window.onload = init;
