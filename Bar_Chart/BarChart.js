function init() {
    // Specify the CSV file
    const file = 'BarChartDataset.csv';

    // Load data from the CSV file
    d3.csv(file)
        .then(function (data) {
            visualizeData(data);
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });
}

// Function to visualize the data
function visualizeData(data) {
    // Extract country names and their corresponding male, female, and total values
    const countryNames = data.map(d => d['Country Name']);
    const maleData = data.map(d => ({ country: d['Country Name'], value: +d['Male'], gender: 'Male' }));
    const femaleData = data.map(d => ({ country: d['Country Name'], value: +d['Female'], gender: 'Female' }));
    const totalData = data.map(d => ({ country: d['Country Name'], value: +d['Total'] }));

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 20, bottom: 30, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a group for each country
    const countryGroups = svg.selectAll(".country-group")
        .data(totalData)
        .enter()
        .append("g")
        .attr("class", "country-group")
        .attr("transform", d => `translate(0, ${y(d.country)})`);

    // Define a color scale for male and female
    const colorScale = d3.scaleOrdinal()
        .domain(['Male', 'Female'])
        .range(['steelblue', 'pink']);

    // Create stacked bars
    countryGroups.selectAll(".bar-segment")
        .data(d => [maleData.find(item => item.country === d.country), femaleData.find(item => item.country === d.country)])
        .enter()
        .append("rect")
        .attr("class", "bar-segment")
        .attr("x", d => x(d[0].value))
        .attr("width", d => x(d[1].value) - x(d[0].value))
        .attr("y", 0)
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => colorScale(i === 0 ? 'Male' : 'Female'))
        .on("mouseover", function (event, d) {
            // Show tooltip on mouseover
            d3.select(this).style("opacity", 0.7);
            showTooltip(d[0], 'Male');
            showTooltip(d[1], 'Female');
        })
        .on("mouseout", function () {
            // Remove tooltip on mouseout
            d3.select(this).style("opacity", 1);
            hideTooltip();
        });

    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Function to show tooltip
    function showTooltip(data, gender) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "8px")
            .html(`${gender} - Country: ${data.country}<br>Value: ${data.value.toLocaleString()}`);

        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
    }

    // Function to hide tooltip
    function hideTooltip() {
        d3.select(".tooltip").remove();
    }
}

window.onload = init;
