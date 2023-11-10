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
        // Extract country names from the dataset
        const countries = data.map(d => d['US States']);

        // Define color scale for each US state within a country
        const colorScale = d3.scaleOrdinal()
            .domain(data.columns.slice(1))
            .range(d3.schemeCategory10);

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

        // Define x and y scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d['Total'])]) // Assuming 'Total' is the column for total value
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(countries)
            .range([0, height])
            .padding(0.1);

        // Create bars
        svg.selectAll(".bar-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(0, ${y(d['US States'])})`)
            .selectAll("rect")
            .data(d => data.columns.slice(1).map(key => ({ key, value: +d[key] })))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.key))
            .attr("width", d => x(d.value))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.key));

        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format(".2s"))); // Format x-axis labels as SI units

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 20}, 0)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(data.columns.slice(1))
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
