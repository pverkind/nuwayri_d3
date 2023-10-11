function buildScatterLegend(colorScale, width, margin) {
  var legendSvg = d3.select("#legend")
    .html("")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 75);
  legendSvg.append("g")
    .attr("class", "legendSequential")
    .attr("transform", "translate(80,20)");

   var legend = d3.legendColor()
     .cells(10)
     .shapeWidth(40)
     .orient('horizontal')
     .scale(colorScale)
     .ascending(true)
     .title("Number of characters reused in the milestone:")
     .labelFormat(".0f")   // no decimals
     .labelAlign("start");  // align label with start of each rectangle

   legendSvg.select(".legendSequential")
     .call(legend);
}
