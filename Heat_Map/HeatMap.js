function init() {
    var w = 500;
    var h = 300;
  
    var projection = d3.geoMercator()
      .center([145, -36.5])
      .translate([w / 2, h / 2])
      .scale(2450);
  
    // Set up the path generator
    var path = d3.geoPath()
      .projection(projection);
  
    var svg = d3.select("#chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);
  
    // Add a group for the map features
    var g = svg.append("g");
  
    // Create a zoom behavior for the SVG
    var zoom = d3.zoom()
      .scaleExtent([1, 8]) // Set your desired scale extent
      .on("zoom", zoomed);
  
    svg.call(zoom);
  
    d3.json("USA_State.json").then(function (json) {
      // Append path elements for each feature in the JSON data
      g.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "grey"); // Set the fill color here
  
      // Define a reset function for zoom
      function reset() {
        g.transition().call(zoom.transform, d3.zoomIdentity);
      }
  
      // Define the zoomed function
      function zoomed(event) {
        g.attr("transform", event.transform);
      }
  
      // Attach a click event to reset zoom
      svg.on("click", reset);
    });
  }
  
  window.onload = init;
  