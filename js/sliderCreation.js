/* General function to create range sliders to filter a graph

Arguments:
    parentDivID (str): ID of the div in which ihe slider should be placed
    sliderName (str): name of the slider, which will be used in the IDS of
      the different components (<sliderName>-container, <sliderName>-slider, ...)
    minVal (int): minimum value to be displayed on the slider
    maxVal (int): maximum value to be displayed on the slider
    startMinVal (int): initial lower value of the range
    startMaxVal (int): initial upper value of the range
    filterFunctions (array): array of functions used to filter the data based on the slider values
    updateFunctions (array): array of function used to update the grqphs
    datasets (array): array of datasets to be filtered
*/

function createSlider(parentDivID, sliderName, labelText, minVal, maxVal, startMinVal, startMaxVal){
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

  return [minInput, slider, maxInput];
}

/* General function to add event listeners to range sliders to filter a graph

Arguments:
    minInput (): the input field for the minimum value to which an event listener should be attached
    slider (): the slider to which an event listener should be attached
    maxInput (): the input field for the maximum value to which an event listener should be attached
    filterFunctions (array): array of functions used to filter the data based on the slider values
    updateFunctions (array): array of function used to update the grqphs
    datasets (array): array of datasets to be filtered
*/

function addSliderEventListener(minInput, slider, maxInput, filterFunctions, updateFunctions, datasets) {
  console.log("Adding event listener to slider");
  console.log(filterFunctions);
  // add event listeners so the slider updates the inputs
  // when sliding ends,
  // and the inputs update the slider when user presses enter in them
  slider.noUiSlider.on('end', function (values) {
    minInput.value = parseInt(values[0]);
    maxInput.value = parseInt(values[1]);
    for (let i=0; i < filterFunctions.length; i++) {
      console.log(i);
      filterFunctions[i](values, datasets[i], updateFunctions[i]);
    }
  });
  minInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([minInput.value, null]);
      for (let i=0; i < filterFunctions.length; i++) {
        console.log(i);
        filterFunctions[i](values, datasets[i], updateFunctions[i]);
      }
    }
  }, false);
  maxInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([null, maxInput.value]);
      for (let i=0; i < filterFunctions.length; i++) {
        console.log(i);
        filterFunctions[i](values, datasets[i], updateFunctions[i]);
      }
    }
  }, false);
}

function addChMatchSliderEventListener(minInput, slider, maxInput, filter_ch_match, updateScatter, updateBar, ms_data, stats, mainVersionID) {
  console.log("Adding event listener to ch_match slider");
  // add event listeners so the slider updates the inputs
  // when sliding ends,
  // and the inputs update the slider when user presses enter in them
  slider.noUiSlider.on('end', function (values) {
    minInput.value = parseInt(values[0]);
    maxInput.value = parseInt(values[1]);
    filter_ch_match(values, updateScatter, updateBar, ms_data, stats, mainVersionID);
  });
  minInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([minInput.value, null]);
      filter_ch_match(values, updateScatter, updateBar, ms_data, stats, mainVersionID);
    }
  }, false);
  maxInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {  // Enter pressed
      slider.noUiSlider.set([null, maxInput.value]);
      filter_ch_match(values, updateScatter, updateBar, ms_data, stats, mainVersionID);
    }
  }, false);
}
