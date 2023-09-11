/* global d3, crossfilter, timeSeriesChart, barChart */




// d3.select("body").append("svg")
// .attr("width", "100%")
// .attr("height", "150%")
// .attr("x", "0")
// .attr("y", "0")
// .attr("transform", "translate(0,0)")
// .append("image")
// .attr("xlink:href", "https://www.webintravel.com/wp-content/uploads/2020/05/den-belitsky-GettyImages-854673918-scaled.jpg")
// // .attr("xlink:href", "https://media.istockphoto.com/id/807395598/photo/milky-way-and-silhouette-of-a-airplane-landscape-with-passenger-airplane-is-flying-in-the.jpg?b=1&s=170667a&w=0&k=20&c=jG8r5bcWSIy8_m6Yl04bpoa1Vw4BoqNBhE3JWRCWKzM=")
// .attr("width", "100%")
// .attr("height", "710")
// .attr("x", "0")
// .attr("y", "-215")
// .attr("transform", "translate(0,0)");



var title = d3.select("body")
.append("h1")
.text("Timeline Visualization")
.attr("id", "title");


var title2 = d3.select("body")
.append("h2")
.text("Select an area of chart by selecting a region and dragging over desired area")
.style("color", "grey");


// 2015-05-01 00:43:28
var dateFmt = d3.timeParse("%Y");

var chartTimeline = timeSeriesChart()
  .width(1500)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
var barChartGate = barChart()
  .width(600)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
var barChartCar = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

d3.csv("data/birdstrikes_Final_1.csv",
  function (d) {
    // This function is applied to each row of the dataset
    d.Timestamp = dateFmt(d["year"]);
    // console.log(d["Flight Date"]);
    return d;
  },
  function (err, data) {
    if (err) throw err;

    var csData = crossfilter(data);

    // We create dimensions for each attribute we want to filter by
    csData.dimTime = csData.dimension(function (d) { return d.Timestamp; });
    csData.dimCarType = csData.dimension(function (d) { return d["Airport Name"]; });
    csData.dimGateName = csData.dimension(function (d) { return d["Origin State"]; });

    // We bin each dimension
    csData.timesByHour = csData.dimTime.group(d3.timeHour);
    csData.carTypes = csData.dimCarType.group();
    csData.gateNames = csData.dimGateName.group();


    chartTimeline.onBrushed(function (selected) {
      csData.dimTime.filter(selected);
      update();
    });

    
    
    barChartCar.onMouseOver(function (d) {
      csData.dimCarType.filter(d.key);
      // show name on hover
      // d3.select("#carTypes").text(d.key);
      d3.select("#gates").text(d.key);
      
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimCarType.filterAll();
      // d3.select("#gates").remove(text(d.key));
      // Clear the text on mouse out
      // d3.select("#CarTypes").remove();
      // d3.selectAll.text().remove(d.key);
      // d3.select("#gates").text("");
      
      update();
    });
    
    barChartGate.onMouseOver(function (d) {
      csData.dimGateName.filter(d.key);
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimGateName.filterAll();
      // d3.select("#gates").text().remove();
      update();
    });

    function update() {
      d3.select("#timeline")
        .datum(csData.timesByHour.all())
        .call(chartTimeline);

      d3.select("#carTypes")
        .datum(csData.carTypes.all())
        .call(barChartCar)
        .select(".x.axis") //Adjusting the tick labels after drawn
        .selectAll(".tick text")
        .attr("transform", "translate(-8,10) rotate(-45)");

      d3.select("#gates")
        .datum(csData.gateNames.all())
        .call(barChartGate)
        .select(".x.axis") //Adjusting the tick labels after drawn
        .selectAll(".tick text")
        .attr("transform", "translate(-8,-1) rotate(-45)");

    }

    update();


  }
);