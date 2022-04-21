//function updateScatter(incomingData, scatterPlot, xScale, yScale, colorScale, bookUriDict, dotSize){
function updateScatter(incomingData, scatterPlot){
  // Add data to scatterPlot:
  scatterPlot
    // select all <circle> tag in the scatterPlot
    .selectAll("circle")
    // bind the (filtered) milestone reuse data to the selection
    .data(incomingData)
    // create a new <circle> tag for the number of data points that are not yet in the graph:
    .enter()
      .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(d.bookIndex); } )
        .attr("cy", function (d) { return yScale(d.ms1); } )
        .attr("r", dotSize)
        .style("fill", function (d) { return colorScale(d.ch_match) } )
        // add tooltip:
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Milestone in main book: "+ d.ms1 +"<br/>Book 2: "+bookUriDict[d.id2] + "<br/>Milestone in book 2: "+d.ms2 + "<br/>Character match: "+d.ch_match + "<br/>Book index: "+d.bookIndex)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 0);
        })
    // remove superfluous data points:
    .exit()
      .remove();
}
