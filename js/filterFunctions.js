function filter_ch_match(values, updateScatter, updateBar, ms_reuse, stats, mainVersionID) {
  // function called when the ch_match slider is updated

  // first, filter the milestone data and update the scatter plot:
  console.log("currently, "+ms_reuse.length+" data points are shown");
  let dataFilter = ms_reuse.filter(function(d) {return d.ch_match >= values[0] && d.ch_match <= values[1]});
  console.log("After updating, "+dataFilter.length+" data points will be shown");
  updateScatter(dataFilter);

  // calculate total character matches from the filtered milestone data
  // and use this to filter the stats for the bar plot:
  let updatedTotalMatches = new Object();
  for (let i=0; i<dataFilter.length; i++){
    if (!updatedTotalMatches.hasOwnProperty(dataFilter[i].id2)) {
      //console.log(dataFilter[i].id2);
      updatedTotalMatches[dataFilter[i].id2] = 0;
    }
    updatedTotalMatches[dataFilter[i].id2] += dataFilter[i].ch_match;
  }
  let updatedStats = [];
  for (let i=0; i<stats.length; i++){
    if (stats[i].id !== mainVersionID){
      if (updatedTotalMatches.hasOwnProperty(stats[i].id)) {
        let row = stats[i];
        row.ch_match = updatedTotalMatches[stats[i].id];
        updatedStats.push(row);
      }
    }
  }
  console.log("number of stats: "+stats.length);
  console.log("number of updated stats: "+updatedStats.length);

  updateBar(updatedStats);
}


function filter_date(values, data, updateFunction) {
  // function called when the date slider is updated
  console.log("currently, "+data.length+" data points are shown");
  let dataFilter = data.filter(function(d) {
    return (d.date >= values[0] && d.date <= values[1]);
  });
  console.log("After updating, "+dataFilter.length+" data points will be shown");
  updateFunction(dataFilter);
}
