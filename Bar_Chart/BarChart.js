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
    const maleData = data.map(d => ({ country: d['Country Name'], value: +d['Male'] }));
    const femaleData = data.map(d => ({ country: d['Country Name'], value: +d['Female'] }));
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

    // Define x and y scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(totalData, d => d.value)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(countryNames)
        .range([height, 0])
        .padding(0.1);

    // Create total bars
    svg.selectAll(".bar-total")
        .data(totalData)
        .enter()
        .append("rect")
        .attr("class", "bar-total")
        .attr("x", 0)
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth());

    // Create male bars
    svg.selectAll(".bar-male")
        .data(maleData)
        .enter()
        .append("rect")
        .attr("class", "bar-male")
        .attr("x", 0)
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth())
        .on("mouseover", function (event, d) {
            // Show tooltip on mouseover
            d3.select(this).style("fill", "darkblue");
            showTooltip(d, 'Male');
        })
        .on("mouseout", function () {
            // Remove tooltip on mouseout
            d3.select(this).style("fill", "steelblue");
            hideTooltip();
        });

    // Create female bars
    svg.selectAll(".bar-female")
        .data(femaleData)
        .enter()
        .append("rect")
        .attr("class", "bar-female")
        .attr("x", d => x(d.value))
        .attr("y", d => y(d.country))
        .attr("width", d => width - x(d.value))
        .attr("height", y.bandwidth())
        .on("mouseover", function (event, d) {
            // Show tooltip on mouseover
            d3.select(this).style("fill", "darkpink");
            showTooltip(d, 'Female');
        })
        .on("mouseout", function () {
            // Remove tooltip on mouseout
            d3.select(this).style("fill", "pink");
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
