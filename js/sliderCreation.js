/* General function to create range sliders to filter a graph

Arguments:
    parentDivID (str): ID of the div in which ihe slider should be placed
    sliderName (str): name of the slider, which will be used in the IDS of
      the different components (<sliderName>-container, <sliderName>-slider, ...)
    minVal (int): minimum value to be displayed on the slider
    maxVal (int): maximum value to be displayed on the slider
    startMinVal (int): initial lower value of the range
    startMaxVal (int): initial upper value of the range
    filterFunction (func): function used to filter the data based on the slider values
    updateFunction (func): function used to update the grqph
    plotObj (graph object): graph to be updated
    ms_reuse (array): reuse data
*/

function createSlider(parentDivID, sliderName, labelText, minVal, maxVal, startMinVal, startMaxVal, filterFunction, updateFunction, plotObj, ms_reuse){
  let parentDiv = document.getElementById(parentDivID);

  // create a container for the slider:
  let componentContainer = document.createElement("div");
  componentContainer.setAttribute("class", "slider-container");
  componentContainer.setAttribute("id", sliderName+"-slider-container");
  parentDiv.appendChild(componentContainer);

  // create the slider's label:
  let label =  document.createElement("p");
  label.innerText = labelText;
  componentContainer.appendChild(label);

  // create the slider itself:
  let slider =  document.createElement("div");
  slider.setAttribute("id", sliderName+"-slider");
  slider.setAttribute("class", "slider");
  componentContainer.appendChild(slider);
  noUiSlider.create(slider, {
      start: [startMinVal, startMaxVal],
      connect: true,
      range: {
          'min': minVal,
          'max': maxVal
      },
      step: 1
  });

  // create the input box for the lower end of the range:
  let minInput = document.createElement("input");
  minInput.setAttribute("type", "text");
  minInput.setAttribute("class", "slider-input-min");
  minInput.classList.add("slider-input");
  minInput.setAttribute("id", sliderName+"-input-min");
  minInput.setAttribute("value", startMinVal);
  componentContainer.appendChild(minInput);

  // create the input box for the upper end of the range:
  let maxInput = document.createElement("input");
  maxInput.setAttribute("type", "text");
  maxInput.setAttribute("class", "slider-input-max");
  maxInput.classList.add("slider-input");
  maxInput.setAttribute("id", sliderName+"-input-max");
  maxInput.setAttribute("value", startMaxVal);
  componentContainer.appendChild(maxInput);

  // add event listeners so the slider updates the inputs
  // when sliding ends,
  // and the inputs update the slider when user presses enter in them
  slider.noUiSlider.on('end', function (values) {
    minInput.value = parseInt(values[0]);
    maxInput.value = parseInt(values[1]);
    filterFunction(values, ms_reuse, updateFunction, plotObj);
  });
  minInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([minInput.value, null]);
      filterFunction([minInput.value, maxInput.value], ms_reuse, updateFunction, plotObj);
    }
  }, false);
  maxInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([null, maxInput.value]);
      filterFunction([minInput.value, maxInput.value], ms_reuse, updateFunction, plotObj);
    }
  }, false);
  return [minInput, slider, maxInput];
}
