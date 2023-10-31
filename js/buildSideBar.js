function buildSideBarPlot(msStats, yScale, height, margin, msBooks) {
  console.log("BUILDING SIDE BAR!");
  // Define the div for the tooltip in the graph:
  let div = d3.select("#viz3")
    .html("")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // append the svg object to its container div:
  //let width = 100 - margin.left - margin.right;
  let width = 100;
  let sidebarSvg = d3.select("#viz3")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(0," + margin.top + ")");
  
  // build X axis scale (Y axis scale inherited from scatterplot):
  let maxTotalChMatch = d3.max(msStats, d => d.ch_match_total);
  console.log("MaxTotalChMatch: "+maxTotalChMatch);
  let xScale = d3.scaleLinear()
      .domain([0, maxTotalChMatch])
      .range([0, width]);

  // Add X axis:
  let xAxisG = sidebarSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.format('.2s'))
      .ticks(4)
      .tickSize(2)

    );

  // Add X axis label:
  sidebarSvg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", 150)
    //.attr("y", height)
    .attr("dx", "-4em")
    //.attr("transform", "rotate(-90)")
    .text("Characters reused");

  // Add Y axis:
  let yAxisG = sidebarSvg.append("g")
    .call(d3.axisLeft(yScale)
    .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
    .tickSize(0)      
  );


  let sidebarPlot = sidebarSvg.append('g')
    .attr("class", "sidebar-plot");

  // Bind data to the plot:
  function updateSidebar(incomingData) {
    console.log("Updating side bar plot with "+incomingData.length+" data points.");
    let sidebarPlot = d3.select(".sidebar-plot");
    sidebarPlot
      // remove all previous content:
      .html("")
      // select all <rect> tag in the sidebarPlot
      .selectAll("rect")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
      // create a new <circle> tag for the number of data points that are not yet in the graph:
      .enter()
        .append("rect");

    // remove superfluous data points:
    sidebarPlot
      // select all <circle> tag in the sidebarPlot
      .selectAll("rect")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
        .exit()
          .remove();

    // re-distribute the data to the remaining circles:
    let barHeight = height/msStats.length;
    sidebarPlot
      .selectAll("rect")
      .data(incomingData)
        .attr("class", "bar")
        .attr("height", barHeight)
        .attr("y", d => yScale(d.ms_id) - barHeight/2)
        //.attr("x", d => xScale(d.ch_match_total))
        .attr("x", 0)
        .attr("width", d => xScale(d.ch_match_total) )
        .style("fill", "#3FB8AF")
        .style("stroke", "#3FB8AF")
        // add tooltip:
        .on("mouseover", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", .9);
          let tooltipMsg = "Milestone "+d.ms_id+":";
          tooltipMsg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match_total);
          tooltipMsg += "<br/>Number of books: " + d3.format(",")(msBooks[d.ms_id]);
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

  return [sidebarPlot, updateSidebar];
}
