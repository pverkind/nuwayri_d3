var mainBookURI = "0733Nuwayri.Nihaya";
var mainBookID = "Shamela0010283";
var mainBookMilestones = 7995;
var ms_reuse_fp = "data/2021.2.5_Shamela0010283_all.csv";
var stats_fp = "data/2021.2.5_Shamela0010283_stats.csv";



// Define the div for the tooltip in the graph:
var div = d3.select("#my_dataviz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//based on: https://d3-graph-gallery.com/graph/scatter_grouped.html

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
//d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {
d3.csv(ms_reuse_fp, function(ms_reuse_data) {
  // NB: d3.csv loads csv file as array of objects (like csv.DictReader in Python)
  d3.csv(stats_fp, function(stats_data) {

    let [ms_reuse, stats, maxChMatch, minChMatch, minDate, maxDate, bookIndexDict, bookUriDict] = prepareData(ms_reuse_data, stats_data);

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, stats.length])  // each book will have its own space on the X axis
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([mainBookMilestones,0])   // filp the axis!
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Color scale:
    var color = d3.scaleOrdinal()
      .domain([1,2,3,4,5,6])
      .range([ "#fff596ff", "#ffdc07ff", "#ff8d00ff", "#ff0000ff", "#ae0000ff", "#000000ff"]) // https://www.color-hex.com/color-palette/45851
      //var color = d3.scaleSequential()
      //  .domain([1,maxChMatch])
      //  .interpolator(d3.interpolateInferno);


    // Add dots
    var scatterPlot = svg.append('g')
    //svg.append('g')
      .selectAll("dot")
      .data(ms_reuse)
      .enter()
      .append("circle")
        //.attr("cx", function (d) { return x(d.Sepal_Length); } )
        //.attr("cy", function (d) { return y(d.Petal_Length); } )
        //.attr("r", 5)
        //.style("fill", function (d) { return color(d.Species) } )
        .attr("cx", function (d) { return x(d.bookIndex); } )
        .attr("cy", function (d) { return y(d.ms1); } )
        .attr("r", 1)
        .style("fill", function (d) { return color(d.ch_match) } )
        // add tooltip:
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Milestone in main book: "+ d.ms1 +"<br/>Book 2: "+bookUriDict[d.id2] + "<br/>Milestone in book 2: "+d.ms2 + "<br/>Character match: "+d.ch_match)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

     // Add line symbolizing Nuwayri's text:

     function updatePlot(filteredData, scatterPlot) {
       console.log("updating plot");
       scatterPlot.selectAll("dot")
         .data(filteredData)
         .join("dot")
           .attr("cx", function (d) { return x(d.bookIndex); } )
           .attr("cy", function (d) { return y(d.ms1); } )
           .attr("r", 1)
           .style("fill", function (d) { return color(d.ch_match) } )
           // add tooltip:
           .on("mouseover", function(d) {
               div.transition()
                   .duration(200)
                   .style("opacity", .9);
               div.html("Milestone in main book: "+ d.ms1 +"<br/>Book 2: "+bookUriDict[d.id2] + "<br/>Milestone in book 2: "+d.ms2 + "<br/>Character match: "+d.ch_match)
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
               })
           .on("mouseout", function(d) {
               div.transition()
                   .duration(500)
                   .style("opacity", 0);
           });
      console.log("Plot updated (?)");
    }


     // ch_match slider:

      let labelText = "Number of characters matched in milestone:";
      let [ch_match_minInput, ch_match_slider, ch_match_maxInput] = createSlider("myFilters", "ch_match", labelText, minChMatch, maxChMatch, minChMatch, maxChMatch, filter_ch_match, scatterPlot, ms_reuse);
      console.log(ch_match_minInput.value);

      // date slider:

       labelText = "Date of book 2:";
       let [date_minInput, date_slider, date_maxInput] = createSlider("myFilters", "date", labelText, minDate, maxDate, minDate, maxDate, filter_ch_match, scatterPlot, ms_reuse);
       console.log(ch_match_minInput.value);



  })
})
