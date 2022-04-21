function filter_ch_match(values, ms_reuse, updateFunction, plotObj) {
  // function called when the ch_match slider is updated
  console.log("currently, "+ms_reuse.length+" data points are shown");
  var dataFilter = ms_reuse.filter(function(d) {return d.ch_match >= values[0] && d.ch_match <= values[1]});
  console.log("After updating, "+dataFilter.length+" data points will be shown");
  updateFunction(dataFilter, plotObj);  // this does not work yet
}

function filter_date(values, ms_reuse, updateFunction, plotObj) {
  // function called when the date slider is updated
  console.log("currently, "+ms_reuse.length+" data points are shown");
  var dataFilter = ms_reuse.filter(function(d) {
    return (d.date >= values[0] && d.date <= values[1]);
  });
  console.log("After updating, "+dataFilter.length+" data points will be shown");
  updateFunction(dataFilter, plotObj);  // this does not work yet
}
