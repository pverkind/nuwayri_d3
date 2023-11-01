/* Manipulate the raw input data into more usable form */

function prepareMsData(ms_reuse) {
  // add up the length of the alignments for each milestone in book 1:
  let msStats = {};
  let msBooks = {};

  // prepare ms_reuse data and define the minimum and maximum character match values in the data:
  for (var i=0; i < ms_reuse.length; i++) {
    // convert numeric fields into integers:
    ms_reuse[i]["ms1"] = parseInt(ms_reuse[i]["ms1"]);
    ms_reuse[i]["b1"] = parseInt(ms_reuse[i]["b1"]);
    ms_reuse[i]["e1"] = parseInt(ms_reuse[i]["e1"]);
    ms_reuse[i]["ms2"] = parseInt(ms_reuse[i]["ms2"]);
    ms_reuse[i]["b2"] = parseInt(ms_reuse[i]["b2"]);
    ms_reuse[i]["e2"] = parseInt(ms_reuse[i]["e2"]);
    ms_reuse[i]["ch_match"] = parseInt(ms_reuse[i]["ch_match"]);
    // add unique ID field for each row:
    ms_reuse[i]["id"] = i;
    // add the length of the alignment in book 2 to the aggregator for ms1:
    msStats[ms_reuse[i]["ms1"]] = (msStats[ms_reuse[i]["ms1"]] || 0) + ms_reuse[i]["ch_match"];
    // count the number of books that have text reuse for ms1:
    msBooks[ms_reuse[i]["ms1"]] = (msBooks[ms_reuse[i]["ms1"]] || 0) + 1;
  }
  // convert msStats Object into an array of objects:
  msStats = Object.keys(msStats).map(key => ({ms_id: parseInt(key), ch_match_total: msStats[key]}));
  
  return [ms_reuse, msStats, msBooks];
}

function prepareStats(stats) {

  // sort the stats by book URI:
  stats.sort((a,b) => (a.book > b.book) ? 1 : ((b.book > a.book) ? -1 : 0))

  // add date and book_index fields, and convert numeric fields into integers:
  var bookIndexDict = new Object();
  var bookUriDict = new Object();
  for (var i=0; i < stats.length; i++) {
    stats[i]["alignments"] = parseInt(stats[i]["alignments"]);
    stats[i]["ch_match"] = parseInt(stats[i]["ch_match"]);
    stats[i]["bookIndex"] = i+1;
    bookIndexDict[stats[i]["id"]] = stats[i]["bookIndex"];
    bookUriDict[stats[i]["id"]] = [stats[i]["book"]];
    let date = parseInt(stats[i]["book"].substring(0,4));
    stats[i]["date"] = date;
  }
  console.log("Number of books in stats: "+ stats.length);

  return [stats, bookIndexDict, bookUriDict];

}
