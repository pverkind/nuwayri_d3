function main(dataBasePath, OpenITIVersion, mainVersionID) {
  let meta = getMeta(mainVersionID);  // this is currently a dummy function; in the final version, this should call the metadata API.
  window.mainBookMilestones = meta.lastMilestone;
  window.mainBookURI = meta.bookURI;
  window.OpenITIVersion = OpenITIVersion;
  //let ms_reuse_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_all.csv"; // currently loaded from local data folder, will be loaded from GitHub later
  //let stats_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_stats.csv";
  //let ms_reuse_fp = `${dataBasePath}${OpenITIVersion}_${mainVersionID}_all.csv`; // currently loaded from local data folder, will be loaded from GitHub later
  let ms_reuse_fp = `${dataBasePath}${OpenITIVersion}/${mainVersionID}_all.csv`;
  console.log(ms_reuse_fp);
  let stats_fp = `${dataBasePath}${OpenITIVersion}/${mainVersionID}_stats.csv`;
  console.log(stats_fp);

  window.latestTransform = d3.zoomIdentity;

  // Add title:
  d3.select("#pageTitle").html("Text reuse in "+mainBookURI+" for all books in the OpenITI corpus");


  //based on: https://d3-graph-gallery.com/graph/scatter_grouped.html

  // set the dimensions and margins of the graph
  let margin = {top: 10, right: 30, bottom: 10, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  //Read the data
  d3.csv(ms_reuse_fp, function(ms_reuse_data) {
    // NB: d3.csv loads csv file as array of objects (like csv.DictReader in Python)
    d3.csv(stats_fp, function(stats_data) {
      // build the scatter plot
      buildScatterPlot(ms_reuse_data, stats_data, mainBookMilestones, mainBookURI, mainVersionID, width, height, margin);

      window.selectedData = window.ms_reuse;
      window.selectedStats = window.stats;
      // populate the scatter plot:
      window.updateScatter(window.latestTransform);

      // add a color legend:
      buildScatterLegend(width, margin);

      // add barplot to show size of text reuse per book:
      buildBarPlot(ms_reuse, stats, mainBookURI, xScale, width);
      window.updateBar(window.latestTransform);

      // Zoom/Drag handler
      const zoom_function = d3.zoom().scaleExtent([1, 1000])
          .on('zoom', () => {
              const transform = d3.event.transform;
              context.save();
              window.updateScatter(transform);
              context.restore();
          });

      window.scatterCanvas.call(zoom_function);

      // add metadata tooltip to scatter canvas::
      d3.select(".canvas-plot")
      .on("mousemove", function () {
        // Get mouse positions from the main canvas:
        let mouseX = d3.event.layerX || d3.event.offsetX;  // event.layerx returns the mouse X position including scrolling. This can break so use offsetX as a fallback
        let mouseY = d3.event.layerY || d3.event.offsetY;
        /*
        // Pick the colour from the mouse position:
        let col = window.hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
        // Then stringify the values in a way our map-object can read it.
        let colKey = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
        // Get the data from our map!
        if (colKey !== "rgb(0,0,0)") {
          let d = window.ms_reuse[parseInt(window.ms_reuse_map[colKey])];
          console.log(d);
          let tooltipMsg = "Milestone in "+mainBookURI+": " + d.ms1;
          if (d.id2 !== mainVersionID) {
            tooltipMsg += "<br/>Milestone in "+bookUriDict[d.id2]+": " + d.ms2;
            tooltipMsg += "<br/>Character match: " + d.ch_match;
          }*/
        let d = getReuseDataFromCanvas(mouseX, mouseY);
        if (d){
          d3.select(".canvas-plot").style("cursor", "pointer");
          let tooltipMsg = "Milestone in "+mainBookURI+": " + d.ms1;
          if (d.id2 !== mainVersionID) {  // do not explain the following info if the user clicked a milestone from the main book:
            tooltipMsg += "<br/>Milestone in "+bookUriDict[d.id2]+": " + d.ms2;
            tooltipMsg += "<br/>Character match: " + d.ch_match;
          }
          d3.select(".tooltip")
            .style("opacity", .9)
            .html(tooltipMsg)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
        } else {
          d3.select(".canvas-plot").style("cursor", "auto");
          d3.select(".tooltip")
            .style("opacity", 0);
        }

      });

      // add diff tooltip to scatter canvas::
      d3.select(".canvas-plot")
      .on("click", function () {
        // Get mouse positions from the main canvas:
        let mouseX = d3.event.layerX || d3.event.offsetX;  // event.layerx returns the mouse X position including scrolling. This can break so use offsetX as a fallback
        let mouseY = d3.event.layerY || d3.event.offsetY;
        let d = getReuseDataFromCanvas(mouseX, mouseY);
        if (d && d.id2 !== mainVersionID){
          let tooltipMsg = "Milestone in "+mainBookURI+": " + d.ms1;
          tooltipMsg += "<br/>Milestone in "+bookUriDict[d.id2]+": " + d.ms2;
          tooltipMsg += "<br/>Character match: " + d.ch_match;
          let msText1 = displayMilestoneText("#ms1-text", window.OpenITIVersion, mainVersionID, d.ms1, d.b1, d.e1);
          //let msText2 = displayMilestoneText("#ms2-text", window.OpenITIVersion, d.id2, d.ms2, d.b2, d.e2);
          // temporary dummy solution: display text 1 twice, as long as not all texts are in the text API:
          let msText2 = displayMilestoneText("#ms2-text", window.OpenITIVersion, mainVersionID, d.ms1, d.b1, d.e1);
          d3.select("#ms1-id")
            .html(mainVersionID + ", ms"+d.ms1);
          d3.select("#ms2-id")
            .html(d.id2 + ", ms"+d.ms2);
          d3.select(".diff-tooltip")
            .style("opacity", .9)
            //.html(tooltipMsg)
            .style("left", 50 + "px")
            .style("right", 50 + "px")
            .style("top", (d3.event.pageY)+100 + "px");
        } else {
          d3.select(".diff-tooltip")
            .style("opacity", 0);
        }

      });


      // build table that will display stats for the updated books in the graph
      let statsTableBody = buildStatsTable(stats);
      let statsTableHead = document.getElementById("stats-table-head");
      let headers = statsTableHead.querySelectorAll("th");
      /*for (let i=0; i<headers.length; i++) {
        headers[i].addEventListener("click", function (i) {
          sortColumn(i);
        });
      }*/
      [].forEach.call(headers, function (header, index) {
        header.addEventListener('click', function () {
          sortColumn(index);
        });
      });

      // build slider for the number of characters matched:
      let labelText = "Number of characters matched in milestone:";
      [window.ch_match_minInput, window.ch_match_slider, window.ch_match_maxInput] = createSlider("filters", "ch_match", labelText, window.minChMatch, window.maxChMatch, window.minChMatch, window.maxChMatch);
      addChMatchSliderEventListener(filter_ch_match,  updateScatter, updateBar);

      // build slider for the date of book 2:
      labelText = "Date of book 2:";
      let [date_minInput, date_slider, date_maxInput] = createSlider("filters", "date", labelText, minDate, maxDate, minDate, maxDate, filter_date, [updateScatter, updateBar], [scatterCanvas, barPlot], ms_reuse);
      addSliderEventListener(date_minInput, date_slider, date_maxInput, [filter_date, filter_date], [updateScatter, updateBar], [ms_reuse, stats]);

    });
  });
}

/*
Use the color coding of the hidden canvas to return the text reuse metadata
for a given point (milestone) in the graph.

Returns an ms_reuse object for that milestone that contains data on both
milestones and the text reuse between them.
*/
function getReuseDataFromCanvas(mouseX, mouseY){
  let col = window.hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
  // Then stringify the values in a way our map-object can read it.
  let colKey = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
  // Get the data from our map!
  if (colKey !== "rgb(0,0,0)") {
    let d = window.ms_reuse[parseInt(window.ms_reuse_map[colKey])];
    console.log(d);
    return d
  }
  return false;
}

const displayMilestoneText = async(divID, releaseVersion, versionID, msNo, start, end)  => {
  const data = await getMilestoneText(window.OpenITIVersion, versionID, msNo);
  d3.select(divID)
    .html(data["ms_text"].substring(start, end));
  return data
}
