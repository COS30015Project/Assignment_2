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
      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const x = d3.scaleLinear().range([0, width]);
      const y = d3.scaleLinear().range([height, 0]);

      const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.value));

      const svg = d3.select("#line-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

      const countries = Array.from(new Set(data.map(d => d.country))); // Change 'dataset' to 'data'

      d3.select("#country-select")
          .on("change", updateChart);

      function updateChart() {
          const selectedCountry = d3.select("#country-select").node().value;
          const filteredData = data.filter(d => d.country === selectedCountry);

          x.domain(d3.extent(filteredData, d => d.year));
          y.domain([0, d3.max(filteredData, d => d.value)]);

          svg.selectAll("*").remove();

          svg.append("path")
              .data([filteredData])
              .attr("class", "line")
              .attr("d", line);

          svg.append("g")
              .attr("transform", `translate(0, ${height})`)
              .call(d3.axisBottom(x));

          svg.append("g")
              .call(d3.axisLeft(y));

          svg.append("text")
              .attr("transform", "translate(10, 0)")
              .attr("dy", "1em")
              .style("font-size", "12px")
              .style("font-weight", "bold")
              .text(selectedCountry);
      }

      updateChart();
  }
}

window.onload = init;
