function init() 
{
    // Define variables
    const margin = { top: 30, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let x, y, line, legends, years; // Define years here at a higher scope

    // Load the data from the CSV file
    d3.csv("CurrencyData.csv")
        .then(function(data) {
            years = data.columns.slice(2).map(year => parseInt(year)); // Define years here
            visualizeData(data);
            addBrushing(data);
        })
        .catch(function(error) {
            console.error("Error loading data:", error);
        });

   function visualizeData(data) {
       // Extract the data fields you need
       const years = data.columns.slice(2).map(year => parseInt(year)); // Parse years to integers

       // Generate a custom color scale with unique colors for each country
       const uniqueColors = data.map((d, i) => d3.interpolateSinebow(i / data.length));
       const colorScale = d3.scaleOrdinal(data.map(d => d['Asian Country']), uniqueColors);

       // Define the x and y scales
       x = d3.scaleLinear()
           .domain([d3.min(years), d3.max(years)])
           .range([0, width]);

       y = d3.scaleLinear()
           .domain([0, d3.max(data, d => d3.max(years.map(year => +d[year])))])
           .range([height, 0]);

       // Create a line generator
       line = d3.line()
           .x((d, i) => x(years[i]))
           .y(d => y(+d));

       // Create the lines with different colors
       svg.selectAll(".line")
           .data(data)
           .enter()
           .append("path")
           .attr("class", "line")
           .attr("d", d => line(years.map(year => +d[year])))
           .style("fill", "none")
           .style("stroke", (d) => colorScale(d['Asian Country']))
           .style("stroke-width", 2);

       // Add dots for each year
       const dots = svg
           .selectAll(".dot-group")
           .data(data)
           .enter()
           .append("g")
           .attr("class", "dot-group");

       dots.selectAll("circle")
           .data((d) => years.map(year => ({ year, value: +d[year], name: d['Asian Country'] })))
           .enter()
           .append("circle")
           .attr("class", "dot")
           .attr("cx", (d) => x(d.year))
           .attr("cy", (d) => y(d.value))
           .attr("r", 4)
           .style("fill", (d) => colorScale(d.name))
           .on("mouseover", (event, d) => {
               // Show tooltip on mouseover
               const tooltip = d3.select("body").append("div")
                   .attr("class", "tooltip")
                   .style("position", "absolute")
                   .style("background-color", "white")
                   .style("padding", "8px")
                   .html(`Country: ${d.name}<br>Year: ${d.year}<br>Value: ${d.value}`);
               tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 30) + "px");
           })
           .on("mouseout", () => {
               // Remove tooltip on mouseout
               d3.select(".tooltip").remove();
           });

       // Add axes
       svg.append("g")
           .attr("class", "x-axis") // Add class for the x-axis
           .attr("transform", `translate(0, ${height})`)
           .call(d3.axisBottom(x).ticks(years.length).tickFormat(d3.format("d")));

       svg.append("g")
           .attr("class", "y-axis") // Add class for the y-axis
           .call(d3.axisLeft(y));

       // Add legend
       const legendContainer = d3.select("body").select(".legend-container");

       legendItems = data.map((d) => {
           return {
               color: colorScale(d['Asian Country']),
               name: d['Asian Country'],
           };
       });

       legends = legendContainer
           .selectAll(".legend-item")
           .data(legendItems)
           .enter()
           .append("div")
           .attr("class", "legend-item");

       legends
           .append("div")
           .style("background-color", (d) => d.color)
           .attr("class", "legend-color");

       legends
           .append("text")
           .text((d) => d.name);
   }

   function addBrushing(data) {
       // Function to handle brushing
       function brushed(event) {
           const selection = event.selection;
           if (!selection) return;

           // Convert x and y values of the selection to corresponding data values
           const [x0, y1] = selection.map(x.invert, x);
           const [x1, y0] = [x0, y1];

           // Update the chart with the new domain
           x.domain([x0, x1]);
           y.domain([y0, y1]);

           // Redraw the lines and dots with the updated scales
           svg.selectAll(".line")
               .attr("d", d => line(years.map(year => +d[year])));
           svg.selectAll(".dot")
               .attr("cx", (d) => x(d.year))
               .attr("cy", (d) => y(d.value));

           // Update the axes
           svg.select(".x-axis").call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
           svg.select(".y-axis").call(d3.axisLeft(y));

           // Update the legend items
           legends.style("opacity", (d) => {
               const xValue = x(d.year);
               const yValue = y(d.value);
               return xValue >= x0 && xValue <= x1 && yValue >= y0 && yValue <= y1 ? 1 : 0.2;
           });
       }

       // Add brushing functionality
       const brush = d3.brush()
           .extent([[0, 0], [width, height]])
           .on("end", brushed);

       svg.append("g")
           .attr("class", "brush")
           .call(brush);
   }

}

window.onload = init;
