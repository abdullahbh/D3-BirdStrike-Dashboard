var width = 800;
var height = 500;

//add title to the page
var title = d3.select("body")
    .append("h1")
    .text("Map Visualization")
    .attr("id", "title");


  var title2 = d3.select("body")
    .append("h2")
    .text("Hover over points to see the name of the Airport")
    .style("color", "grey");




var projection = d3.geo
  .albersUsa()
  .translate([width / 2, height / 2])
  .scale([1200]);

var path = d3.geo.path().projection(projection);

var legendText = ["Airports"];
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    
var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.json("data/us.json", function (json) {
  const states = svg
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#fff")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .style("fill", "#ddd")
    .on("mouseover", function (d) {
      d3.select(this).style("fill", "#F2A900");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("fill", "#ddd");
    });




var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.csv("data/airportCoordinates.csv", function (data) {
  var airports = svg
    .selectAll("g")
    .data(data)
    .enter()
    .append("circle")
    // .append("image")
    // .attr("xlink:href", "data/location.png")
    // .attr("width", 20)
    // .attr("height", 20)
    .attr("r", 5)
    .style("fill", "#386F90")


    .attr("transform", function (d) {
      return "translate(" + projection([d.longitude, d.latitude]) + ")";
    })

    .on("mouseover", function (d) {
      console.log(d.airport);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html("<h4>" + d.state + "</h4>" + d.airport)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .style("background-color", "#386F90")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "13px");
        d3.select(this).style("fill", "red")
        .attr("r", 8)
        .style("opacity", 0.5);






    })

    .on("mouseout", function (d) {
      console.log(d.airport);
      div.transition().duration(500).style("opacity", 0);
      d3.select(this).style("fill", "#386F90")
      .attr("r", 5)
      .style("opacity", 1);
    });

//zoom using d3 
svg.call(d3.behavior.zoom().on("zoom", function () {
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
  }
));


// add filter button to the page 
var filter = d3.select("body")
  .append("button")
  .text("Highlight Airports")
  .attr("id", "filter")
  .on("click", function () {
    console.log("button clicked");
    airports.style("fill", "red")
    .attr("r", 8);
  }
);

// add filter button to the page
var filter = d3.select("body")
  .append("button")
  .text("Reset")
  .attr("id", "filter")
  .on("click", function () {
    console.log("button clicked");
    airports.style("fill", "#386F90")
    .attr("r", 5);
  }
);


});  





});


