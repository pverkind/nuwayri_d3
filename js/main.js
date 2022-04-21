function main(dataBasePath, OpenITIVersion, mainVersionID) {
  let meta = getMeta(mainVersionID);  // this is currently a dummy function; in the final version, this should call the metadata API.
  let mainBookMilestones = meta.lastMilestone;
  let mainBookURI = meta.bookURI;
  let ms_reuse_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_all.csv"; // currently loaded from local data folder, will be loaded from GitHub later
  let stats_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_stats.csv";

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
      let r = buildScatterPlot(ms_reuse_data, stats_data, mainBookMilestones, mainBookURI, mainVersionID, width, height, margin);
      let [ms_reuse, stats, updateScatter, scatterPlot, colorScale, xScale, minChMatch, maxChMatch, minDate, maxDate] = r
      // populate the scatter plot:
      updateScatter(ms_reuse);

      // add a color legend:
      buildScatterLegend(colorScale, width, margin);

      // add barplot to show size of text reuse per book:
      let [barPlot, updateBar] = buildBarPlot(ms_reuse, stats, mainBookURI, xScale, width);
      updateBar(stats);

       // build slider for the number of characters matched:

        let labelText = "Number of characters matched in milestone:";
        let [ch_match_minInput, ch_match_slider, ch_match_maxInput] = createSlider("filters", "ch_match", labelText, minChMatch, maxChMatch, minChMatch, maxChMatch, filter_ch_match, updateScatter, scatterPlot, ms_reuse);

        // build slider for the date of book 2:

         labelText = "Date of book 2:";
         let [date_minInput, date_slider, date_maxInput] = createSlider("filters", "date", labelText, minDate, maxDate, minDate, maxDate, filter_date, updateScatter, scatterPlot, ms_reuse);

    })
  })
}
