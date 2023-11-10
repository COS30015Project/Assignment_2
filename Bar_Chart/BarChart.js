function init()
{
    // Use 'fetch' to load data from a CSV file
fetch('BarChartDataset.csv')
.then(response => response.text())
.then(data => {
    const parsedData = d3.csvParse(data);
    visualizeData(parsedData);
})
.catch(error => console.error('Error loading data:', error));

function visualizeData(data) {
// Extract US state names from the dataset
const usStates = data.map(d => d['US States']);

// Extract country names from the headers
const countries = data.columns.slice(1);

// Create an array to store the total values for each country
const totalValues = countries.map(country => ({
    country,
    total: d3.sum(data, d => +d[country])
}));

// Define color scale
const colorScale = d3.scaleOrdinal()
    .domain(usStates)
    .range(d3.schemeCategory10);

// Define dimensions for the SVG
const margin = { top: 30, right: 30, bottom: 80, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 560 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define x and y scales
const x = d3.scaleBand()
    .domain(countries)
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, d3.max(totalValues, d => d.total)])
    .range([height, 0]);

// Create bars
svg.selectAll(".bar-group")
    .data(totalValues)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.total))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.total))
    .attr("fill", (d, i) => colorScale(usStates[i]));

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
    .data(usStates)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => colorScale(d));

legendItems.append("text")
    .text(d => d)
    .attr("x", 20)
    .attr("y", 10);
}

}

window.onload = init;