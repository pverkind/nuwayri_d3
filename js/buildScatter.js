function buildScatterPlot(ms_reuse_data, stats_data, mainBookMilestones, mainBookURI, mainVersionID, width, height, margin, colors=d3.interpolateInferno) {
  // rescale to the height of Tabari's Tafsīr:
  //height = (mainBookMilestones / 9702) * height;


  // Define the div for the tooltip in the graph:
  let div = d3.select("#viz")
    .html("")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


  // append the svg object to its container div:
  let scatterSvg = d3.select("#viz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // format the milestone reuse data:
  let [ms_reuse, msStats, msBooks] = prepareMsData(ms_reuse_data);
  //let ms_reuse = prepareMsData(ms_reuse_data);
  let [minChMatch, maxChMatch] = d3.extent(ms_reuse, d => d.ch_match);

  // add dummy columns for each milestone in the main book,
  //so that each milestone in the main book is displayed as a black dot in the graph:
  let last_i = ms_reuse.length-1;
  for (let i=0; i <= mainBookMilestones; i++) {
    ms_reuse.push({"ms1": i, "b1": 0, "e1": maxChMatch, "id2": mainVersionID, "ms2": i, "b2": 0, "e2": maxChMatch, "ch_match": maxChMatch, "id": last_i + i + 1});
  }

  // add stats of the main book to the stats_data array:
  stats_data.push({"id": mainVersionID, "book": mainBookURI, "alignments": mainBookMilestones, "ch_match": "0"});

  // format the book statistics data and create dictionaries
  // to look up the x axis position of each book (bookIndexDict)
  // and the text URI of each version ID (bookUriDict)
  let [stats, bookIndexDict, bookUriDict] = prepareStats(stats_data);

  // calculate some useful values based on the book metadata:
  let [minDate, maxDate] = d3.extent(stats, d => d.date);
  let dotSize = Math.min(Math.ceil(width/stats.length/2), Math.ceil(height/mainBookMilestones/2));

  // add bookIndex + date to the ms_reuse data:
  for (let i=0; i < ms_reuse.length; i++) {
    ms_reuse[i]["bookIndex"] = bookIndexDict[ms_reuse[i]["id2"]];
    //ms_reuse[i]["ch_match_class"] = Math.ceil(6 * ms_reuse[i]["ch_match"] / maxChMatch);
    ms_reuse[i]["date"] = parseInt(bookUriDict[ms_reuse[i]["id2"]][0].substring(0, 4));
  }

  // Create color scale:
  let colorScale = d3.scaleSequential()
    .domain([maxChMatch, minChMatch])
    .interpolator(colors);

  // create X and Y scaling functions:
  let xScale = d3.scaleLinear()
    .domain([0, stats.length+2])  // each book will have its own space on the X axis
    .range([ 0, width ]);
  /*let xScale = d3.scaleBand()
    .domain([...Array(stats.length).keys()])
    .range([ 0, width ])
    .align(0.5); // center*/
  let yScale = d3.scaleLinear()
      .domain([mainBookMilestones,0])   // filp the axis!
      .range([ height, 0]);

  // Add X axis:
  let xAxisG = scatterSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)
      .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
      .tickSize(0)
    );

  // Add Y axis:
  let yAxisG = scatterSvg.append("g")
    .call(d3.axisLeft(yScale)
    .tickSize(2)
  );
  // Add Y axis label:
  scatterSvg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", "-4em")
    .attr("transform", "rotate(-90)")
    .text("Milestones in "+mainBookURI);

  // Create scatter plot <g> object
  let scatterPlot = scatterSvg.append('g')
    .attr("class", "scatter-plot");

  // Bind data to the plot:
  function updateScatter(incomingData) {
    console.log("Updating scatter plot with "+incomingData.length+" data points.");
    let scatterPlot = d3.select(".scatter-plot");
    scatterPlot
      // select all <circle> tag in the scatterPlot
      .selectAll("circle")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
      // create a new <circle> tag for the number of data points that are not yet in the graph:
      .enter()
        .append("circle");

    // remove superfluous data points:
    scatterPlot
      // select all <circle> tag in the scatterPlot
      .selectAll("circle")
      // bind the (filtered) milestone reuse data to the selection
      .data(incomingData)
        .exit()
          .remove();

    // re-distribute the data to the remaining circles:
    scatterPlot
      .selectAll("circle")
      .data(incomingData)
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
          let tooltipMsg = "Milestone in "+mainBookURI+": " + d.ms1;
          if (d.id2 !== mainVersionID) {
            tooltipMsg += "<br/>Milestone in "+bookUriDict[d.id2]+": " + d.ms2;
            tooltipMsg += "<br/>Character match: " + d.ch_match;
          }
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
  return [ms_reuse, stats, msStats, msBooks, updateScatter, scatterPlot, colorScale, xScale, yScale, minChMatch, maxChMatch, minDate, maxDate]
}
