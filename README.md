# Nuwayrī app, html version

This is a first attempt to build an html version of the Nuwayrī app, based
on the light one-to-all text reuse data csv files.

It uses D3 to build the visualizations.

To run the app: use a local server like atom-live-server in Atom, or Python's SimpleHTTPServer.

A start has been made to compartmentalize the code:

* js/dataPreparation.js contains the prepareData function that formats the
  raw input data (ms_reuse and stats)
* js/filterFunctions.js will contain a function for each filter (character_match, date, ...);
  those functions process the input from the sliders, filter the data accordingly,
  and update the graph
* js/sliderCreation.js contains a constructor function for new sliders; given a name,
  label, minimum and maximum values, and a filter function that should be
  invoked when the slider changes, a new slider is created. Uses the
  noUiSlider, see  https://refreshless.com/nouislider

BUT: the main js code is still in the html file!

## TO DO:

* put the main js code in a separate file
* Scatter plot:
  - remove X axis ticks and tick labels
  - add axis labels
  - add color legend
  - add zooming in/out function
  - find out why the Nuwayri line is yellow instead of black
* Sliders:
  - make the sliders filter the graph
  - the sliders call the updatePlot function twice already when they are created!
  - format the sliders: smaller + next to each other?
  - add sliders for
    * Nuwayrī milestone number
    * total number of alignments in common with Nuwayrī
    * ...
* add a bar graph at the bottom to show the number of characters
  in text reuse alignments for each book2.
* add a filtered list of book titles?
* check the Nuwayrī app which elements we would like to transfer to html/d3 version
* integrate with diff viewer (load diff when clicking a milestone in the graph?)
