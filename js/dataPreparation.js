/* Manipulate the raw input data into more usable form */

function prepareData(ms_reuse, stats) {
  // prepare ms_reuse data and define the minimum and maximum character match values in the data:
  var maxChMatch = 0;
  var minChMatch = 2000;
  for (var i=0; i < ms_reuse.length; i++) {
    // convert numeric fields into integers:
    ms_reuse[i]["ms1"] = parseInt(ms_reuse[i]["ms1"]);
    ms_reuse[i]["b1"] = parseInt(ms_reuse[i]["b1"]);
    ms_reuse[i]["e1"] = parseInt(ms_reuse[i]["e1"]);
    ms_reuse[i]["ms2"] = parseInt(ms_reuse[i]["ms2"]);
    ms_reuse[i]["b2"] = parseInt(ms_reuse[i]["b2"]);
    ms_reuse[i]["e2"] = parseInt(ms_reuse[i]["e2"]);
    ms_reuse[i]["ch_match"] = parseInt(ms_reuse[i]["ch_match"]);
    // update the minimum and maximum character match values:
    if (ms_reuse[i]["ch_match"] > maxChMatch) {
      maxChMatch = ms_reuse[i]["ch_match"];
    }
    if (ms_reuse[i]["ch_match"] < minChMatch) {
      minChMatch = ms_reuse[i]["ch_match"];
    }
  }
  console.log("Max character match: "+maxChMatch);

  // add dummy columns for each Nuwayri milestone:
  for (var i=0; i <= mainBookMilestones; i++) {
    ms_reuse.push({"ms1": i, "b1": 0, "e1": maxChMatch, "id2": mainBookID, "ms2": i, "b2": 0, "e2": maxChMatch, "ch_match":maxChMatch});
  }

  // add Nuwayri stats:
  stats.push({"id": mainBookID, "book": mainBookURI, "alignments": mainBookMilestones, "ch_match": "0"});

  // sort the stats by book URI:
  stats.sort((a,b) => (a.book > b.book) ? 1 : ((b.book > a.book) ? -1 : 0))

  // add date and book_index fields, and convert numeric fields into integers:
  var bookIndexDict = new Object();
  var bookUriDict = new Object();
  var maxDate = 0;
  var minDate = 2000;
  for (var i=0; i < stats.length; i++) {
    stats[i]["alignments"] = parseInt(stats[i]["alignments"]);
    stats[i]["ch_match"] = parseInt(stats[i]["ch_match"]);
    stats[i]["bookIndex"] = i;
    bookIndexDict[stats[i]["id"]] = i;
    bookUriDict[stats[i]["id"]] = [stats[i]["book"]];
    let date = parseInt(stats[i]["book"].substring(0,4));
    stats[i]["date"] = date;
    if (date < minDate) {
      minDate = date;
    }
    if (date > maxDate) {
      maxDate = date;
    }
  }
  console.log(stats[0]);
  console.log("Number of books in stats: "+ stats.length);

  // add bookIndex + chMatchClass to the ms_reuse data:
  for (var i=0; i < ms_reuse.length; i++) {
    ms_reuse[i]["bookIndex"] = bookIndexDict[ms_reuse[i]["id2"]];
    ms_reuse[i]["ch_match_class"] = Math.ceil(5 * ms_reuse[i]["ch_match"] / maxChMatch);
  }

  return [ms_reuse, stats, maxChMatch, minChMatch, minDate, maxDate, bookIndexDict, bookUriDict];

}
