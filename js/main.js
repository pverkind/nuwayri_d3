async function main(dataBasePath, OpenITIVersion, mainVersionID) {
  /*document.getElementById("viz").innerHTML="";
  document.getElementById("viz2").innerHTML="";
  document.getElementById("legend").innerHTML="";
  document.getElementById("filters").innerHTML="";*/
  if (OpenITIVersion === "2022.2.7" || OpenITIVersion === "2023.1.8") {
    dataBasePath = `https://raw.githubusercontent.com/kitab-project-org/one_to_all/v${OpenITIVersion}/`;
  }
  if (mainVersionID === "UPLOAD") {
    console.log("UPLOAD!");
  }
  let meta = await getMeta(mainVersionID, OpenITIVersion);  // this is currently a dummy function; in the final version, this should call the metadata API.
  console.log(meta);
  let mainBookMilestones = meta.lastMilestone;
  let mainBookURI = meta.bookURI;
  let ms_reuse_fp, stats_fp;
  if (OpenITIVersion === "2022.2.7" || OpenITIVersion === "2023.1.8") {
    ms_reuse_fp = `${dataBasePath}/msdata/${OpenITIVersion}_${mainVersionID}_all.csv`
    stats_fp = `${dataBasePath}/stats/${OpenITIVersion}_${mainVersionID}_stats.csv`
  } else {
    ms_reuse_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_all.csv"; // currently loaded from local data folder, will be loaded from GitHub later
    stats_fp = dataBasePath+OpenITIVersion+"_"+mainVersionID+"_stats.csv";
  }

  // get the desired color range:
  blueButton = document.getElementById("blues");
  let colors = blueButton.checked 
    ? d3.interpolateRgb("blue", "lightblue") 
    : d3.interpolateInferno;

  // set the change event for the radio buttons:
  let radioButtons = document.querySelectorAll('input[name="color_radio"]');
  for (const radioButton of radioButtons) {
    radioButton.addEventListener("click", () => {

      main(dataBasePath, OpenITIVersion, mainVersionID);
    });
  }

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
      let r = buildScatterPlot(ms_reuse_data, stats_data, mainBookMilestones, mainBookURI, mainVersionID, width, height, margin, colors);
      let [ms_reuse, stats, msStats, msBooks, updateScatter, scatterPlot, colorScale, xScale, yScale, minChMatch, maxChMatch, minDate, maxDate] = r
      // populate the scatter plot:
      updateScatter(ms_reuse);

      // add a color legend:
      buildScatterLegend(colorScale, width, margin);

      // add barplot to show size of text reuse per book:
      let [barPlot, updateBar] = buildBarPlot(ms_reuse, stats, mainBookURI, xScale, width);
      updateBar(stats);

      // add barplot to show size of text reuse per milestone:
      let [sidebarPlot, updateSidebar] = buildSideBarPlot(msStats, yScale, height, margin, msBooks);
      updateSidebar(msStats);

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

     //d3.select("#filters").html("");
     document.getElementById("filters").replaceChildren();
     // build slider for the number of characters matched:
      let labelText = "Number of characters matched in milestone:";
      let [ch_match_minInput, ch_match_slider, ch_match_maxInput] = createSlider("filters", "ch_match", labelText, minChMatch, maxChMatch, minChMatch, maxChMatch);
      addChMatchSliderEventListener(ch_match_minInput, ch_match_slider, ch_match_maxInput, filter_ch_match,  updateScatter, updateBar, ms_reuse, stats, mainVersionID);

      // build slider for the date of book 2:
       labelText = "Date of book 2:";
       let [date_minInput, date_slider, date_maxInput] = createSlider("filters", "date", labelText, minDate, maxDate, minDate, maxDate, filter_date, [updateScatter, updateBar], [scatterPlot, barPlot], ms_reuse);
       addSliderEventListener(date_minInput, date_slider, date_maxInput, [filter_date, filter_date], [updateScatter, updateBar], [ms_reuse, stats]);
    })
  })
}
