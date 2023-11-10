// Function to visualize the data
function visualizeData(data) {
    // Extract country names and their corresponding total values
    const countries = data.columns.slice(1);
    const totals = data[data.length - 1];

    // Combine country names and total values into an array of objects
    const countryData = countries.map((country, index) => ({
        country: country,
        total: +totals[country], // Convert total to a number
        states: data.map(d => ({ state: d['US States'], value: +d[country] })) // Extract state values
    }));

    // Sort the data by total value in descending order
    countryData.sort((a, b) => b.total - a.total);

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

    // Define color scale for US states
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(countryData, d => d3.max(d.states, s => s.value))]);

    // Define x and y scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.total)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(countryData.map(d => d.country))
        .range([height, 0])
        .padding(0.1);

    // Create bars with multiple colors for each US state
    svg.selectAll(".bar")
        .data(countryData)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d.country)})`)
        .selectAll("rect")
        .data(d => d.states)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.value))
        .on("mouseover", function (event, d) {
            // Show tooltip on mouseover
            d3.select(this).style("fill", "darkblue");
            showTooltip(d);
        })
        .on("mouseout", function (event, d) {
            // Remove tooltip on mouseout
            d3.select(this).style("fill", d => colorScale(d.value));
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
    function showTooltip(data) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "8px")
            .html(`State: ${data.state}<br>Value: ${data.value.toLocaleString()}`);

        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
    }

    // Function to hide tooltip
    function hideTooltip() {
        d3.select(".tooltip").remove();
    }
}
