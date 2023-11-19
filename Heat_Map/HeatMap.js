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
  
    Promise.all([
      d3.json("usa.json"), // Load GeoJSON data
      d3.csv("2022.csv") // Load CSV data
    ]).then(function (data) {
      const json = data[0];
      const csvData = data[1];
  
      const { processedData, processedTotal, maxTotal } = processData(csvData);
  
      // Set up the tooltip
      const Tooltip = setupTooltip();
  
      // Set up zoom behavior
      const zoom = setupZoom(svg, g, width, height);
  
      // Draw map features
      drawMapFeatures(g, json, path, processedTotal, maxTotal, zoom, selectedState, Tooltip);
  
      // Create a horizontal legend
      const legendGroup = createLegend(svg, width, height, maxTotal);
  
      // Reset function
      const resetFunction = createResetFunction(selectedState, g, svg, zoom, path);
  
      // Attach events to map features
      attachMapEvents(g, path, zoom, resetFunction);
  
      // Attach events to legend
      attachLegendEvents(legendGroup, processedTotal, maxTotal, g, path, zoom, resetFunction);
    });
  }
  
  function processData(csvData) {
    const processedData = {};
    const processedTotal = {};
  
    csvData.forEach(function (d) {
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
  
    // Set the color domain based on the range of total values
    const totalValues = Object.values(processedTotal).map(d => d.Total);
    const maxTotal = d3.max(totalValues);
  
    return { processedData, processedTotal, maxTotal };
  }
  
  function setupTooltip() {
    return d3.select("body")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "rgba(255, 255, 255, 0.9)")
      .style("border", "1px solid #000")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("position", "absolute");
  }
  
  function setupZoom(svg, g, width, height) {
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", function (event) {
        g.style("stroke-width", 1.5 / event.transform.k + "px");
        g.attr("transform", event.transform);
      });
  
    svg.call(zoom);
    return zoom;
  }
  
  function drawMapFeatures(g, json, path, processedTotal, maxTotal, zoom, selectedState, Tooltip) {
    g.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "feature")
      .style("fill", function (d) {
        const stateName = d.properties.NAME;
        const total = processedTotal[stateName].Total;
        return d3.interpolateGnBu(total / maxTotal);
      })
      .on("click", clicked)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  
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
  
    function mouseover(event, d) {
      Tooltip.style("opacity", 1);
      Tooltip.style("left", (event.pageX + 10) + "px");
      Tooltip.style("top", (event.pageY + 10) + "px");
      if (selectedState !== d) {
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1);
        const stateName = d.properties.NAME;
        const total = processedTotal[stateName].Total;
        Tooltip.html(
          `<div class="tooltip-title">${stateName}</div><div>Total: ${total}</div>`
        );
      }
    }
  
    function mousemove(event, d) {
      if (selectedState === d) {
        const stateName = d.properties.NAME;
        const data = processedData[stateName];
        const formattedData = formatData(data);
        Tooltip.html(stateName + "<br>" + formattedData);
        Tooltip.html(
          `<div class="tooltip-title">${stateName}</div><div>${formattedData}</div>`
        );
      }
    }
  
    function mouseleave(event, d) {
      Tooltip.style("opacity", 0);
      if (selectedState !== d) {
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 1);
      }
    }
  
    function reset() {
      selectedState = null;
      g.selectAll(".feature").style("fill", function (d) {
        const stateName = d.properties.NAME;
        const total = processedTotal[stateName].Total;
        return d3.interpolateGnBu(total / maxTotal);
      });
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }
  }
  
  function createLegend(svg, width, height, maxTotal) {
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - 220}, ${height - 40})`);
  
    const legendWidth = 200;
    const legendHeight = 18;
  
    const legendScale = d3.scaleLinear()
      .domain([0, maxTotal])
      .range([0, legendWidth]);
  
    const legendAxis = d3.axisBottom(legendScale)
      .tickValues(d3.range(0, maxTotal, maxTotal / 4));
  
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
      .style("fill", "url(#colorGradient");
  
    legendGroup.append("g")
      .attr("class", "legend-axis")
      .call(legendAxis);
  
    return legendGroup;
  }
  
  function attachMapEvents(g, path, zoom, resetFunction) {
    g.selectAll(".feature").on("click", clicked)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  
    function clicked(event, d) {
      resetFunction();
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
    }
  
    function mouseover(event, d) {
      Tooltip.style("opacity", 1);
      Tooltip.style("left", (event.pageX + 10) + "px");
      Tooltip.style("top", (event.pageY + 10) + "px");
      if (selectedState !== d) {
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1);
        const stateName = d.properties.NAME;
        const total = processedTotal[stateName].Total;
        Tooltip.html(
          `<div class="tooltip-title">${stateName}</div><div>Total: ${total}</div>`
        );
      }
    }
  
    function mousemove(event, d) {
      if (selectedState === d) {
        const stateName = d.properties.NAME;
        const data = processedData[stateName];
        const formattedData = formatData(data);
        Tooltip.html(stateName + "<br>" + formattedData);
        Tooltip.html(
          `<div class="tooltip-title">${stateName}</div><div>${formattedData}</div>`
        );
      }
    }
  
    function mouseleave(event, d) {
      Tooltip.style("opacity", 0);
      if (selectedState !== d) {
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 1);
      }
    }
  }
  
  function attachLegendEvents(legendGroup, processedTotal, maxTotal, g, path, zoom, resetFunction) {
    legendGroup.on("click", resetFunction);
  
    // Add any additional events related to the legend here
  }
  
  window.onload = init;
  