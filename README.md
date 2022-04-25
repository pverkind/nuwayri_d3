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

To run the app: use a local server like atom-live-server in Atom, or Python's `http.server`.

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

* fix bug in the bar plot when updating date slider
* make bar plot responsive to zooming in the scatter plot
* Scatter plot:
  - make axes responsive to filtering
  - add section headers
  - draw axes on canvas instead of on parent svg???
* Sliders:
  - add sliders for
    * Nuwayrī milestone number
    * total number of alignments in common with Nuwayrī
    * ...
* make the parent divs resize with the window?
* log axis for the bar plot?
* add filters to the URL
* filter the list of book titles + let it act as filter for the graph?
* check the Nuwayrī app which elements we would like to transfer to html/d3 version
* integrate with diff viewer (load diff when clicking a milestone in the graph?)

## Using HTML5 canvas instead of svg:

The latest version of this app uses HTML5 canvas instead of svg for the main scatter plot.

D3 can use svg or html5 canvas to draw the data.
For more than 1.000 datapoints, it is advised to use canvas instead of svg,
because it's much less resource heavy
(with svg, the each element of the graph is an object in the DOM, which can clog up the browser).

The downside of canvas is that interactivity is more complex,
since you cannot bind event listeners to elements of the graph directly.
There's a smart workaround for this, called "picking" : a second, hidden,
canvas is used with the exact same layout as the displayed canvas,
but in which each data point is given a unique colour;
a dictionary maps each colour to an item in the original data.
An on mouse move event listener is attached to the visible canvas
and records the  current x, y position of the cursor,
which can be used to get the color of the pixel at that coordinate in the hidden canvas;
the color can in turn be used to look up the datum associated with that color in the dictionary. 

## Structure of the code:

* index.html: parses the URL, and checks if the query string contains a single version ID;
if so, it loads the data for that text
(currently only 2 sample texts: 0346Istakhri.MasalikWaMamalik and 774Nuwayri.NihayatArab.Shamela0010283);
if not, it loads Istakhri by default. The home page also currently provides buttons to switch
between Istakhri and Nuwayri for debugging purposes
* main.js: contains the scaffolding for the page
  - gets the metadata and file paths to the two tsv functions through a getMeta() function that emulates an API call
  - the data is loaded from tsv files that are currently located in the data/ folder,
    but should in the future be loaded from GitHub
  - main.js calls building functions for the scatter plot, bar plot, color legend, table and sliders;
    these functions are grouped in their own js files:
    * buildScatter.js
    * buildBar.js
    * buildLegends.js
    * buildTable.js
    * sliderCreation.js
