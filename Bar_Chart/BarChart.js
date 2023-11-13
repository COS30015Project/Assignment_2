function init() {
    d3.csv('BarChartDataset.csv').then(data => {
        const keys = ["Male", "Female"];

        const stack = d3.stack().keys(keys);

        const series = stack(data);

        const width = 600;
        const height = 400;
        const padding = 40;

        const xScale = d3.scaleBand()
            .domain(data.map(d => d['Country Name']))
            .range([padding, width - padding])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([height - padding, padding]);

        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(['blue', 'pink']);

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const groups = svg.selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .style("fill", (d, i) => colorScale(i));

        const rects = groups.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(data[i]['Country Name']))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        svg.append("g")
            .attr("transform", `translate(0, ${height - padding})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(d3.axisLeft(yScale));

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        function showTooltip(event, d) {
            const gender = d3.select(this.parentNode).datum().key;
            const value = d.data[gender];

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`${gender}: ${d3.format(",")(value)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        function hideTooltip() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
    });
}

window.onload = init;