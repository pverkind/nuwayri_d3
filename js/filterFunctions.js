function filter_ch_match(values, updateScatter, updateBar) {
  // function called when the ch_match slider is updated
  // first, filter the milestone data and update the scatter plot:
  console.log("currently, "+window.ms_reuse.length+" data points are shown");
  window.selectedData = window.ms_reuse.filter(function(d) {return d.ch_match >= values[0] && d.ch_match <= values[1]});
  console.log("After updating, "+window.selectedData.length+" data points will be shown");
  updateScatter(window.latestTransform);

  // calculate total character matches from the filtered milestone data
  // and use this to filter the stats for the bar plot:
  let updatedTotalMatches = new Object();
  for (let i=0; i<window.selectedData.length; i++){
    if (!updatedTotalMatches.hasOwnProperty(window.selectedData[i].id2)) {
      //console.log(dataFilter[i].id2);
      updatedTotalMatches[window.selectedData[i].id2] = 0;
    }
    updatedTotalMatches[window.selectedData[i].id2] += window.selectedData[i].ch_match;
  }
  window.selectedStats = [];
  for (let i=0; i<window.stats.length; i++){
    if (window.stats[i].id !== window.mainVersionID){
      if (updatedTotalMatches.hasOwnProperty(window.stats[i].id)) {
        let row = window.stats[i];
        if (window.stats[i].book !== window.mainBookURI) {
          row.ch_match = updatedTotalMatches[window.stats[i].id];
        } else {
          row.ch_match = 0;
        }
        window.selectedStats.push(row);
      }
    }
  }
  console.log("number of stats: "+window.stats.length);
  console.log("number of updated stats: "+window.selectedStats.length);

  updateBar(window.latestTransform);
}


function filter_date(values, data, updateFunction) {
  // function called when the date slider is updated
  console.log("currently, "+data.length+" data points are shown");
  window.selectedData = data.filter(function(d) {
    return (d.date >= values[0] && d.date <= values[1]);
  });
  console.log("After updating, "+window.selectedData.length+" data points will be shown");
  updateFunction(window.latestTransform);
}
