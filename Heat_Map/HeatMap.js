function init() {
    const width = 1000;
    const height = 650;
  
    const projection = d3.geoAlbersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath()
      .projection(projection);
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const g = svg.append("g");
  
    let selectedState = null;
    let selectedYear = 2022; // Default year
  
    // Create a tooltip
    var Tooltip = d3.select("body")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "rgba(255, 255, 255, 0.9)") // Add transparency to the background color
      .style("border", "1px solid #000") // Add a border
      .style("border-radius", "5px")
      .style("padding", "10px") // Increase padding
      .style("position", "absolute");
  
    // Function to load data for a given year
    function loadData(year) {
      Promise.all([
        d3.json("usa.json"), // Load GeoJSON data
        d3.csv(`${year}.csv`)
      ]).then(function (data) {
        let json = data[0];
        let csvData = data[1];
  
        let processedData = {};
        let processedTotal = {};
  
        updateData(csvData);
  
        // Set the color domain based on the range of total values
        const totalValues = Object.values(processedTotal).map(d => d.Total);
        const maxTotal = d3.max(totalValues);
  
        // Set up zoom behavior
        const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .translateExtent([[0, 0], [width, height]])
          .on("zoom", zoomed);
  
        svg.call(zoom);
  
        function zoomed(event) {
          g.style("stroke-width", 1.5 / event.transform.k + "px");
          g.attr("transform", event.transform);
        }
  
        // Function for mouseover event
        var mouseover = function (event, d) {
          Tooltip.style("opacity", 1);
  
          Tooltip.style("left", (event.pageX + 10) + "px");
          Tooltip.style("top", (event.pageY + 10) + "px");
  
          if (selectedState !== d) {
            d3.select(this)
              .style("stroke", "black")
              .style("opacity", 1);
            const stateName = d.properties.NAME;
            const totalData = processedTotal[stateName];
  
            // Check if data for the state exists
            if (totalData) {
              const total = totalData.Total;
              const formattedData = formatData(processedData[stateName]);
              Tooltip.html(
                `<div class="tooltip-title">${stateName}</div><div>Total: ${total}</div>${formattedData}`
              );
            }
          }
        };
  
        // Function for mousemove event
        var mousemove = function (event, d) {
          if (selectedState === d) {
            const stateName = d.properties.NAME;
            const data = processedData[stateName];
            const formattedData = formatData(data);
            Tooltip.html(
              `<div class="tooltip-title">${stateName}</div>${formattedData}`
            );
          }
        };
  
        // Function for mouseleave event
        var mouseleave = function (event, d) {
          Tooltip.style("opacity", 0);
          if (selectedState !== d) {
            d3.select(this)
              .style("stroke", "none")
              .style("opacity", 1);
          }
        };
  
        g.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "feature")
          .style("fill", function (d) {
            const stateName = d.properties.NAME;
            const totalData = processedTotal[stateName];
  
            // Check if data for the state exists
            if (totalData) {
              const total = totalData.Total;
              return d3.interpolateGnBu(total / maxTotal);
            } else {
              // Handle the case when data is not available
              return "lightgray";
            }
          })
          .on("click", clicked)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave);
  
        // Create a horizontal legend
        const legendGroup = svg.append("g")
          .attr("transform", `translate(${width - 220}, ${height - 40})`);
  
        const legendWidth = 200;
        const legendHeight = 18;
  
        const legendScale = d3.scaleLinear()
          .domain([0, maxTotal])
          .range([0, legendWidth]);
  
        const legendAxis = d3.axisBottom(legendScale)
          .tickValues(d3.range(0, maxTotal, maxTotal / 4));
  
        // Create a linear gradient for the legend
        const defs = svg.append("defs");
  
        const linearGradient = defs.append("linearGradient")
          .attr("id", "colorGradient")
          .attr("x1", "0%")
          .attr("x2", "100%");
  
        linearGradient.append("stop")
          .attr("offset", "0%")
          .style("stop-color", d3.interpolateGnBu(0));
  
        linearGradient.append("stop")
          .attr("offset", "100%")
          .style("stop-color", d3.interpolateGnBu(1));
  
        legendGroup.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#colorGradient)");
  
        legendGroup.append("g")
          .attr("class", "legend-axis")
          .call(legendAxis);
  
        // Reset function
        function reset() {
          selectedState = null;
          g.selectAll(".feature").style("fill", function (d) {
            const stateName = d.properties.NAME;
            const totalData = processedTotal[stateName];
            return totalData ? d3.interpolateGnBu(totalData.Total / maxTotal) : "lightgray";
          });
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }
  
        function clicked(event, d) {
          if (selectedState !== d) {
            reset();
            selectedState = d;
            d3.select(this).style("fill", "red");
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            svg.transition().duration(750).call(
              zoom.transform,
              d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
            );
          } else {
            reset();
          }
        }
  
        // Function to format data
        function formatData(data) {
          const formattedData = [];
          for (const category in data) {
            formattedData.push(`${category}: ${data[category]}`);
          }
          return `<div>${formattedData.join("<br>")}</div>`;
        }
  
        // Slider event handling
        const slider = document.getElementById("yearSlider");
        const selectedYearText = document.getElementById("selectedYear");
  
        slider.addEventListener("input", function () {
          selectedYear = +this.value;
          selectedYearText.textContent = selectedYear;
          d3.csv(`${selectedYear}.csv`).then(function (newCsvData) {
            updateData(newCsvData);
            updateMap();
          });
        });
  
        // Function to update data based on the selected year
        function updateData(newCsvData) {
          processedData = {};
          processedTotal = {};
  
          newCsvData.forEach(function (d) {
            const stateName = d['US States'];
            processedData[stateName] = {
              Bangladesh: +d.Bangladesh,
              China: +d.China,
              India: +d.India,
              Iran: +d.Iran,
              Korea: +d.Korea,
              Pakistan: +d.Pakistan,
              Philippines: +d.Philippines,
              Taiwan: +d.Taiwan,
              Vietnam: +d.Vietnam,
              Others: +d.Others,
            };
  
            processedTotal[stateName] = {
              Total: +d.Total,
            };
          });
        }
  
        // Function to update the map based on the selected year
        function updateMap() {
          g.selectAll("path")
            .data(json.features)
            .transition()
            .duration(500)
            .style("fill", function (d) {
              const stateName = d.properties.NAME;
              const totalData = processedTotal[stateName];
  
              // Check if data for the state exists
              if (totalData) {
                const total = totalData.Total;
                return d3.interpolateGnBu(total / maxTotal);
              } else {
                // Handle the case when data is not available
                return "lightgray";
              }
            });
        }
      });
    }
  
    // Load data for the default year
    loadData(selectedYear);
  }
  
  window.onload = init;
  