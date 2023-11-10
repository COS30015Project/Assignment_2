function init()
{
    d3.csv("BarChart.csv")
    .then(function (data) {
        visualizeData(data);
    })
    .catch(function (error) {
        console.error("Error loading data:", error);
    });

function visualizeData(data) {
    // Extract country names and corresponding total values
    const countries = data.map(d => d['US States']);
    const totalValues = data.map(d => +d['Total']);

    // Define the dimensions for the SVG
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale based on US states
    const colorScale = d3.scaleOrdinal()
        .domain(data.columns.slice(1)) // US states
        .range(d3.schemeCategory10);

    // Create x and y scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(totalValues)])
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
        .selectAll(".bar")
        .data(d => data.columns.slice(1).map(state => ({ state, value: +d[state] })))
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.state))
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.state));

    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 10}, 0)`);

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