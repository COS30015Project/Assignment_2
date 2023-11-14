// D3.js code
function init() {
    d3.csv('BarChartDataset.csv').then(data => {
        // Initial gender selection
        let selectedGender = 'Total';

        const keys = ["Male", "Female", "Total"];
        const stack = d3.stack().keys(keys);
        const series = stack(data);

        const width = 800;
        const height = 500;
        const padding = 40;

        const xScale = d3.scaleBand()
            .domain(data.map(d => d['Country Name']))
            .range([padding, width - padding])
            .padding(0.1)
            .align(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([height - padding, padding]);

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const groups = svg.selectAll("g")
            .data(series)
            .enter()
            .append("g");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Update chart based on selected gender
        window.updateChart = function(gender) {
            selectedGender = gender;
            updateBars();
        };

        function updateBars() {
            const barColor = getBarColor(selectedGender);

            groups.selectAll("rect")
                .data(d => d)
                .transition()
                .duration(500)
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("fill", barColor);

            svg.select(".y-axis")
                .transition()
                .duration(500)
                .call(d3.axisLeft(yScale));

            svg.selectAll("rect")
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);
        }

        function getBarColor(gender) {
            if (gender === "Male") {
                return "#3498db";
            } else if (gender === "Female") {
                return "#e74c3c";
            } else {
                return "#2ecc71";
            }
        }

        const rects = groups.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(data[i]['Country Name']))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("fill", d => getBarColor(d.data.gender));

        svg.append("g")
            .attr("transform", `translate(0, ${height - padding})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("fill", "#555");

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("fill", "#555");

        function showTooltip(event, d) {
            const value = d.data[selectedGender];

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`${selectedGender}: ${d3.format(",")(value)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        function hideTooltip() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
        
        updateBars(); // Initial update
    });
}

window.onload = init;
