# Nuwayrī app, html version

This is a first attempt to build an html version of the Nuwayrī app, based
on the light one-to-all text reuse data csv files.

It uses D3 to build the visualizations.

To run the app: use a webserver like atom-live-server in Atom, or Python's SimpleHTTPServer.


A start has been made to compartmentalize the code:

* js/dataPreparation contains the prepareData function that formats the
  raw input data (ms_reuse and stats)
* filterFunctions will contain a function for each filter (character_match, date, ...);
  those functions process the input from the sliders, filter the data accordingly,
  and update the graph
* sliderCreation contains a constructor function for new sliders; given a name,
  label, minimum and maximum values, and a filter function that should be
  invoked when the slider changes, a new slider is created. Uses the
  noUiSlider, see  https://refreshless.com/nouislider


TO DO:

* Sliders:
    - make the sliders filter the graph
    - the sliders call the updatePlot function twice already when they are created!
    - format the sliders: smaller + next to each other?
* Scatter plot:
    - add axis labels
    - remove X axis ticks and tick labels
    - find out why the Nuwayri line is yellow instead of black
* add a bar graph at the bottom to show the number of characters
  in text reuse alignments for each book2.
* add zoom function
* put the main js in a separate file
