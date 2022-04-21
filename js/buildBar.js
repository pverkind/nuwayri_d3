function buildBarPlot(ms_reuse, stats, mainBookURI, xScale, width) {
  // Define the div for the tooltip in the graph:
  let div = d3.select("#viz2").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // append the svg object to its container div:
  let margin = {top: 0, right: 30, bottom: 30, left: 60};
  let height = 100 - margin.top - margin.bottom;
  let barSvg = d3.select("#viz2")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // build Y axis scale (X axis scale inherited from erplot):
  let maxTotalChMatch = d3.max(stats, d => d.ch_match);
  let yScale = d3.scaleLinear()
      .domain([maxTotalChMatch, 0])
      .range([0, height]);

  // Add X axis:
  let xAxisG = barSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)
      .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
      .tickSize(0)
    );
  // Add X axis label:  see https://stackoverflow.com/a/11194968/4045481
  let xLabelText = "Books for which passim detected text reuse with "+mainBookURI+" (chronologically arranged)";
  barSvg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 20)
    .text(xLabelText);

  // Add Y axis:
  let yAxisG = barSvg.append("g")
    .call(d3.axisLeft(yScale)
      .tickFormat(d3.format('.2s'))
  );
  // Add Y axis label:
  barSvg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", "-4em")
    .attr("transform", "rotate(-90)")
    .text("Characters reused");

  let barPlot = barSvg.append('g')
    .attr("class", "bar-plot");

  // Bind data to the plot:
  function updateBar(incomingData) {
    console.log("Updating bar plot with "+incomingData.length+" data points.");
    let barPlot = d3.select(".bar-plot");
    barPlot
      // select all <rect> tag in the barPlot
      .selectAll("rect")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
      // create a new <circle> tag for the number of data points that are not yet in the graph:
      .enter()
        .append("rect");

    // remove superfluous data points:
    barPlot
      // select all <circle> tag in the barPlot
      .selectAll("rect")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
        .exit()
          .remove();

    // re-distribute the data to the remaining circles:
    let barWidth = width/stats.length;
    barPlot
      .selectAll("rect")
      .data(incomingData)
        .attr("class", "bar")
        .attr("width", barWidth)
        .attr("y", d => yScale(d.ch_match))
        .attr("x", d => xScale(d.bookIndex) - barWidth/2)
        .attr("height", d => height -  yScale(d.ch_match) )
        .style("fill", "blue")
        .style("stroke", "blue")
        // add tooltip:
        .on("mouseover", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", .9);
          let tooltipMsg = d.book;
          tooltipMsg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match);
          div.html(tooltipMsg)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", 0);
      });
  }

  return [barPlot, updateBar];
}
