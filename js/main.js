function main(dataBasePath, OpenITIVersion, mainVersionID) {
  let meta = getMeta(mainVersionID);  // this is currently a dummy function; in the final version, this should call the metadata API.
  let mainBookMilestones = meta.lastMilestone;
  let mainBookURI = meta.bookURI;
  let ms_reuse_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_all.csv"; // currently loaded from local data folder, will be loaded from GitHub later
  let stats_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_stats.csv";

  // Add title:
  d3.select("#pageTitle").html("Text reuse in "+mainBookURI+" for all books in the OpenITI corpus");

  // Define the div for the tooltip in the graph:
  var div = d3.select("#viz").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  //based on: https://d3-graph-gallery.com/graph/scatter_grouped.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // append the svg object to its container div:
  var scatterSvg = d3.select("#viz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv(ms_reuse_fp, function(ms_reuse_data) {
    // NB: d3.csv loads csv file as array of objects (like csv.DictReader in Python)
    d3.csv(stats_fp, function(stats_data) {

      // format the milestone reuse data:
      let ms_reuse = prepareMsData(ms_reuse_data);
      let [minChMatch, maxChMatch] = d3.extent(ms_reuse, d => d.ch_match);

      // add dummy columns for each milestone in the main book,
      //so that each milestone in the main book is displayed as a black dot in the graph:
      let last_i = ms_reuse.length-1;
      for (var i=0; i <= mainBookMilestones; i++) {
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
      var dotSize = Math.min(Math.ceil(width/stats.length/2), Math.ceil(height/mainBookMilestones/2));

      // add bookIndex + date to the ms_reuse data:
      for (var i=0; i < ms_reuse.length; i++) {
        ms_reuse[i]["bookIndex"] = bookIndexDict[ms_reuse[i]["id2"]];
        //ms_reuse[i]["ch_match_class"] = Math.ceil(6 * ms_reuse[i]["ch_match"] / maxChMatch);
        ms_reuse[i]["date"] = parseInt(bookUriDict[ms_reuse[i]["id2"]][0].substring(0, 4));
      }

      // Create color scale:
        var colorScale = d3.scaleSequential()
          .domain([maxChMatch, minChMatch])
          .interpolator(d3.interpolateInferno);

      // create X and Y scaling functions:
      var xScale = d3.scaleLinear()
        .domain([0, stats.length+2])  // each book will have its own space on the X axis
        .range([ 0, width ]);
      var yScale = d3.scaleLinear()
          .domain([mainBookMilestones,0])   // filp the axis!
          .range([ height, 0]);


      // Add X axis:
      let xAxisG = scatterSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
          .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
          .tickSize(0)
        );
      // Add X axis label:  see https://stackoverflow.com/a/11194968/4045481
      scatterSvg.append("text")
      //xAxisG.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 20)
        .text("Books for which passim detected text reuse with "+mainBookURI+" (chronologically arranged)");

      // Add Y axis
      let yAxisG = scatterSvg.append("g")
        .call(d3.axisLeft(yScale));
      // Add Y axis label:
      scatterSvg.append("text")
      //yAxisG.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", "-4em")
        .attr("transform", "rotate(-90)")
        .text("Milestones in "+mainBookURI);

      // Create scatter plot <g> object
      var scatterPlot = scatterSvg.append('g')
      //scatterSvg.append('g')
        .attr("class", "scatter-plot");

      // Add data to the plot:
      const updateScatter = (incomingData, scatterPlot) => {
        console.log("Updating scatter plot with "+incomingData.length+" data points.");
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
              tooltipMsg += "<br/>Milestone in "+bookUriDict[d.id2]+": " + d.ms2;
              tooltipMsg += "<br/>Character match: " + d.ch_match;
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

      // populate the scatter plot:
      updateScatter(ms_reuse, scatterPlot);

      // add a color legend:
      var legendSvg = d3.select("#legend")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", 75);
      legendSvg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(80,20)");

       var legend = d3.legendColor()
         .title("Number of characters reused in the milestone:")
         .labelFormat(".0f")
         .labelAlign("start")
         .cells(10)
         .shapeWidth(40)
         .orient('horizontal')
         .scale(colorScale)
         .ascending(true);

       legendSvg.select(".legendSequential")
         .call(legend);

      /*var barPlot = scatterSvg.append('g')
        .attr("class", "bar-plot")
        .
      */


       // build slider for the number of characters matched:

        let labelText = "Number of characters matched in milestone:";
        let [ch_match_minInput, ch_match_slider, ch_match_maxInput] = createSlider("filters", "ch_match", labelText, minChMatch, maxChMatch, minChMatch, maxChMatch, filter_ch_match, updateScatter, scatterPlot, ms_reuse);

        // build slider for the date of book 2:

         labelText = "Date of book 2:";
         let [date_minInput, date_slider, date_maxInput] = createSlider("filters", "date", labelText, minDate, maxDate, minDate, maxDate, filter_date, updateScatter, scatterPlot, ms_reuse);

    })
  })
}
