# Nuwayrī app, html version

This is a first attempt to build an html version of the Nuwayrī app, based
on the light one-to-all text reuse data csv files.

You can view it online here: https://pverkind.github.io/nuwayri_d3/

It uses D3 to build the visualizations.

As its input, it uses two tsv files, generated from all csv files related to book 1 + the metadata:
* VERSION_BOOK1ID_all.csv: contains reuse data for all alignments involving book 1. Columns: 
   - ms1: milestone number in book 1
   - b1: character offset of the start of the alignment in ms1
   - e1: character offset of the end of the alignment in ms1
   - id2: version ID of book 2
   - ms2: milestone number in book 2
   - b2: character offset of the start of the alignment in ms2
   - e2: character offset of the end of the alignment in ms2
   - ch_match: number of characters matched
* VERSION_BOOK1ID_stats.csv: contains metadata and summary statistics of all books that have alignments with book 1. Columns: 
  - id: version ID of book 2
  - book: book URI of book 2
  - alignments: total number of alignments between book 1 and book 2
  - ch_match: total number of characters matched between book 1 and book 2



To run the app: use a local server like atom-live-server in Atom, or Python's SimpleHTTPServer.

A start has been made to compartmentalize the code:

* js/main.js contains the main code for creating the graph, filters etc. 
* js/dataPreparation.js contains the prepareMsData and prepareStats functions that format the
  raw input data (ms_reuse and stats)
* js/filterFunctions.js contains a function for each filter (character_match, date, ...);
  those functions process the input from the sliders, filter the data accordingly,
  and update the graph
* js/sliderCreation.js contains a constructor function for new sliders; given a name,
  label, minimum and maximum values, and a filter function that should be
  invoked when the slider changes, a new slider is created. Uses the
  noUiSlider, see  https://refreshless.com/nouislider
* js/apiCalls.js contains a dummy function emulating a call to the metadata API.
* js/urlParser.js contains a function to parse the page's URL; this is not functional yet.

## TO DO:

* put the main js code in a separate file
* Scatter plot:
  - add zooming in/out function
* Sliders:
  - add sliders for
    * Nuwayrī milestone number
    * total number of alignments in common with Nuwayrī
    * ...
* add a bar graph at the bottom to show the number of characters
  in text reuse alignments for each book2.
* add a filtered list of book titles?
* check the Nuwayrī app which elements we would like to transfer to html/d3 version
* integrate with diff viewer (load diff when clicking a milestone in the graph?)
* finalize the url parser
