function buildScatterPlot(ms_reuse_data, stats_data, mainBookMilestones, mainBookURI, mainVersionID, width, height, margin) {
  // Make sure the (relative) container has the same size
  // as the (absolute) overlapping svg and canvas elements:
  d3.select("#viz")
    .style("width", width + margin.left + margin.right+"px")
    .style("min-height", height + margin.top + margin.bottom+"px");

  // append the svg object to its container div:
  // (the svg will contain the axes)
  const scatterSvg = d3.select("#viz")
    .append("svg")
      .attr('class', 'svg-plot')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add a hidden canvas, we can use for the tooltip data
  // (see https://medium.com/free-code-camp/d3-and-canvas-in-3-steps-8505c8b27444)
  window.hiddenCanvas = d3.select("#viz").append('canvas')
      .attr('class', 'hidden-canvas')
      .attr('width', width)           // real width of the canvas, in pixels
      .attr('height', height)         // real height of the canvas, in pixels
      .style('width', width+"px")     // width of the canvas on screen
      .style('height', height+"px")   // height of the canvas on screen
      .style('margin-left', margin.left + 'px')
      .style('margin-top', margin.top + 'px');


  // initialize the canvas that will contain the heatmap-coloured dots:
  window.scatterCanvas = d3.select("#viz").append('canvas')
      .attr('class', 'canvas-plot')
      .attr('width', width)           // real width of the canvas, in pixels
      .attr('height', height)         // real height of the canvas, in pixels
      .style('width', width+"px")     // width of the canvas on screen
      .style('height', height+"px")   // height of the canvas on screen
      .style('margin-left', margin.left + 'px')
      .style('margin-top', margin.top + 'px');

  // create context objects to paint to the canvas:
  window.context = scatterCanvas.node().getContext('2d');
  window.hiddenContext = hiddenCanvas.node().getContext('2d');


  // Define the div for the tooltip in the graph:
  /*let div = d3.select("#viz")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);*/
  // Define the div for the diff tooltip in the graph:
  /*let diffDiv = d3.select("#viz")
    .append("div")
      .attr("class", "diff-tooltip")
      .style("opacity", 0);*/

  // format the milestone reuse data:
  window.ms_reuse = prepareMsData(ms_reuse_data);
  [window.minChMatch, window.maxChMatch] = d3.extent(ms_reuse, d => d.ch_match);

  // add dummy columns for each milestone in the main book,
  //so that each milestone in the main book is displayed as a black dot in the graph:
  let last_i = window.ms_reuse.length-1;
  for (let i=0; i <= mainBookMilestones; i++) {
    window.ms_reuse.push({"ms1": i, "b1": 0, "e1": window.maxChMatch, "id2": mainVersionID, "ms2": i, "b2": 0, "e2": window.maxChMatch, "ch_match": window.maxChMatch, "id": last_i + i + 1});
  }

  // add stats of the main book to the stats_data array:
  stats_data.push({"id": mainVersionID, "book": mainBookURI, "alignments": mainBookMilestones, "ch_match": "0"});

  // format the book statistics data and create dictionaries
  // to look up the x axis position of each book (bookIndexDict)
  // and the text URI of each version ID (bookUriDict)
  [window.stats, window.bookIndexDict, window.bookUriDict] = prepareStats(stats_data);

  // calculate some useful values based on the book metadata:
  [window.minDate, window.maxDate] = d3.extent(window.stats, d => d.date);
  let dotSize = Math.min(Math.ceil(width/window.stats.length/2), Math.ceil(height/mainBookMilestones/2));

  // add bookIndex + date to the ms_reuse data:
  for (let i=0; i < window.ms_reuse.length; i++) {
    window.ms_reuse[i]["bookIndex"] = window.bookIndexDict[window.ms_reuse[i]["id2"]];
    //ms_reuse[i]["ch_match_class"] = Math.ceil(6 * ms_reuse[i]["ch_match"] / maxChMatch);
    window.ms_reuse[i]["date"] = parseInt(window.bookUriDict[window.ms_reuse[i]["id2"]][0].substring(0, 4));
  }

  // create a unique colour for each data point,
  // and a dictionary that maps each colour to the index of its associated datapoint in the ms_reuse array:
  window.ms_reuse_map = {} ;
  for (let i=0; i < window.ms_reuse.length; i++) {
    let rgb = []
    if (i+1 < 16777215) { // more than 16 million RGB colors possible
      rgb.push(i+1 & 0xff) // Red ; see https://stackoverflow.com/a/15804183/4045481
      rgb.push((i+1 & 0xff00) >> 8); // Green
      rgb.push((i+1 & 0xff0000) >> 16); // Blue
    }
    var col = "rgb(" + rgb.join(",") + ")";
    window.ms_reuse[i].hiddenCol = col;
    window.ms_reuse_map[col] = i;
  }
  console.log("ms_reuse_map:");
  console.log(ms_reuse_map);

  // Create color scale:
  window.colorScale = d3.scaleSequential()
    .domain([window.maxChMatch, window.minChMatch])
    .interpolator(d3.interpolateInferno);

  // create X and Y scaling functions:
  window.xScale = d3.scaleLinear()
    .domain([0, window.stats.length+2])  // each book will have its own space on the X axis
    .range([ 0, width ]);
  /*let xScale = d3.scaleBand()
    .domain([...Array(stats.length).keys()])
    .range([ 0, width ])
    .align(0.5); // center*/
  let yScale = d3.scaleLinear()
      .domain([mainBookMilestones,0])   // filp the axis!
      .range([ height, 0]);

  // Add X axis:
  let xAxis = d3.axisBottom(window.xScale)
    .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
    .tickSize(0);
  let xAxisG = scatterSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add Y axis:
  let yAxis = d3.axisLeft(yScale)
    .tickSize(2);
  let yAxisG = scatterSvg.append("g")
    .call(yAxis);
  // Add Y axis label:
  scatterSvg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", "-4em")
    .attr("transform", "rotate(-90)")
    .text("Milestones in "+mainBookURI);

  window.updateScatter =  (transform) => {
    console.log("Updating scatter plot with "+window.selectedData.length+" data points.");
    window.xScaleRescaled = transform.rescaleX(window.xScale);
    window.yScatterScaleRescaled = transform.rescaleY(yScale);

    // rescale the axes
    xAxisG.call(xAxis.scale(window.xScaleRescaled));
    yAxisG.call(yAxis.scale(window.yScatterScaleRescaled));

    // remove all points:
    window.context.clearRect(0, 0, width, height);
    window.hiddenContext.clearRect(0, 0, width, height);

    window.selectedData.forEach(d => {
      drawPoint(d, transform.k);
    });
  };


  // draw a data point on both canvases:
  function drawPoint(d, k) {  // d = row object, k = zoom ratio
    // calculate the x and y position of the centre of the circle:
    const cx = window.xScaleRescaled(d.bookIndex);
    const cy = window.yScatterScaleRescaled(d.ms1);

    // draw the data point on each canvas using that canvas's own context object:
    const contexts =  [window.hiddenContext, window.context];
    for (let i=0; i<contexts.length; i++) {
      let context = contexts[i];
      let ds = (k > 5) ? 0.2*k * dotSize : dotSize;
      context.beginPath();
      if (i === 1) {
        // draw circles on the main canvas, in heatmap colors
        context.arc(Math.ceil(cx), Math.ceil(cy), ds, 0, 2 * Math.PI, true); // x, y, radius, arcStartAngle, arcEndAngle, clockwise
        context.fillStyle = window.colorScale(d.ch_match);
      } else {
        // using circles for the hidden canvas does not work well because the edges are anti-aliassed.
        // use squares instead (to avoid anti-aliassing, make sure the cx and cy values are integers)
        context.rect(Math.ceil(cx-(ds)) , Math.ceil(cy-(ds)), Math.ceil(2*ds), Math.ceil(2*ds)); // draw rectangle
        context.fillStyle = d.hiddenCol;
      }
      context.fill();
    }
  }




}
