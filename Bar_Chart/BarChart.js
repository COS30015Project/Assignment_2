function init() {
    // Sample data
    const data = [
        { category: "A", value: 20 },
        { category: "B", value: 35 },
        { category: "C", value: 42 },
        { category: "D", value: 18 },
        { category: "E", value: 50 },
    ];

    // Set up the SVG canvas dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    // Create the x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Create the y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Create the initial bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.category))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value));

    // Add brushing functionality
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        if (event.selection) {
            const [x0, x1] = event.selection.map(xScale.invert);
            
            // Filter the data within the brushed range
            const filteredData = data.filter(d => d.category >= x0 && d.category <= x1);

            // Update the bars
            svg.selectAll(".bar")
                .classed("selected", d => d.category >= x0 && d.category <= x1);
        } else {
            // Reset the bars when brushing is cleared
            svg.selectAll(".bar").classed("selected", false);
        }
    }
}

window.onload = init;
