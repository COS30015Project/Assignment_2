function init() {
    // Load the CSV file and create the pie chart
    d3.csv("PieChart.csv").then(function(data) {
        // Extract column headers (countries)
        const countries = Object.keys(data[0]).slice(0, -1);

        // Extract values for each country
        const values = data.map(d => countries.map(country => +d[country]));

        // Define colors for each country
        const customColors = {
            'Country1': 'white',
            'Country2': 'pink',
        };

        // Create color scale for countries using custom colors
        const colorScale = d3.scaleOrdinal()
            .domain(countries)
            .range(countries.map(country => customColors[country]));

        // Set up the pie chart layout
        const pie = d3.pie();

        // Set up the arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(250); // Adjust the outerRadius for a smaller pie chart

        // Create SVG container for the pie chart
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", 600) // Adjust the width for a smaller pie chart
            .attr("height", 600) // Adjust the height for a smaller pie chart
            .append("g")
            .attr("transform", "translate(300,300)"); // Adjust the translate for centering

        // Generate arcs and bind data
        const arcs = svg.selectAll("path")
            .data(pie(values[0]))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => colorScale(countries[i]))
            .attr("stroke", "#fff") // Add stroke to pie chart slices for better visibility
            .attr("stroke-width", 1) // Set the stroke width
            .on("mouseover", function (event, d) {
                const total = d3.sum(values[0]);
                const percentage = ((d.data / total) * 100).toFixed(2);
                d3.select("#tooltip")
                    .html(`${d.data} (${percentage}%)`)
                    .style("opacity", 1)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");
            })
            .on("mouseout", function () {
                d3.select("#tooltip").style("opacity", 0);
            });

        // Create legend
        const legend = d3.select("#legend")
            .selectAll(".legend-item")
            .data(countries)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legend.append("span")
            .style("background-color", d => colorScale(d));

        legend.append("p")
            .text(d => d)
            .style("color", "#fff"); // Adjust the legend text color for better readability
    });
}

window.onload = init;
