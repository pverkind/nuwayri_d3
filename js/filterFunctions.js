function filter_ch_match(values, ms_reuse, plotObj) {
  // function called when the ch_match slider is updated
  console.log("currently, "+ms_reuse.length+" data points are shown");
  var dataFilter = ms_reuse.filter(function(d) {return d.ch_match >= values[0] && d.ch_match <= values[1]});
  console.log("After updating, "+dataFilter.length+" data points will be shown");
  //updatePlot(dataFilter, plotObj);  // this does not work yet
}
