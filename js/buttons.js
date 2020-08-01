// Handle button clicks

import { getShareURL } from './share.js';
import { copyToClipboard } from './copy_to_clipboard.js';


/**
  * Stop propagation of events from elements defined by `selector`
  * to their parents.
  *
  * @param  {string} event  A HTML enent, e.g. "mousedown".
  * @param  {string} selector A CSS selector for child elements.
  */
function stopClickPropagation(event, selector) {
  var buttons = document.querySelectorAll(selector);

  buttons.forEach((button) => {
    button.addEventListener(event, (e) => e.stopPropagation());
  });
}

/**
 * Toggle visibility of the HTML elements: i.e. hide element if it's visible,
 * and show if it's hidden.
 *
 * @param  {array} elements HTML elements.
 */
function toggleElements(elements) {
  elements.forEach((element) => {
    element.classList.toggle('TwoGalaxies-button--isHidden');
  });
}

function didClickRestart(currentParams) {
  return () => {
    // Restart the simulation
    currentParams.positions = null;
    currentParams.velocities = null;
    currentParams.accelerations = null;

    return false; // Prevent default
  };
}

function didClickReverseTime(currentParams, buttons) {
  return (e) => {
    currentParams.timeDirection *= -1;

    // Show time forward and hide time backward button when clicked and vice versa
    toggleElements(buttons);

    return false; // Prevent default
  };
}

function didClickPause(currentParams, buttons) {
  return (e) => {
    currentParams.paused = true;

    // Show play and hide pause button when pause is clicked and vice versa
    toggleElements(buttons);

    return false; // Prevent default
  };
}

function didClickResume(currentParams, buttons) {
  return (e) => {
    currentParams.paused = false;

    // Show play and hide pause button when pause is clicked and vice versa
    toggleElements(buttons);

    return false; // Prevent default
  };
}

function didClickFastForward(currentParams, fastForwardSeconds) {
  return (e) => {
    currentParams.fastForwardSeconds = fastForwardSeconds;
    return false; // Prevent default
  };
}

function clearSelection()
{
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
}

function didClickShare(initialParams, currentParams) {
  return (e) => {
    hideAllControls();
    clearSelection();

    var outcomeElement = document.querySelector('.TwoGalaxies-copyOutcome');
    outcomeElement.innerHTML = "&nbsp;";

    var container = document.querySelector(".TwoGalaxies-shareContainer");
    container.classList.remove("TwoGalaxies--isHidden");

    let url = getShareURL(initialParams, currentParams);

    let textArea = document.querySelector(".TwoGalaxies-shareText");
    textArea.value = url;

    // Show the area and the copy button
    textArea.classList.remove("TwoGalaxies--isHidden");

    var button = document.querySelector(".TwoGalaxies-copyToClipboardButton");
    button.classList.remove("TwoGalaxies--isHidden");

    return false; // Prevent default
  };
}

function didClickCopyToClipboard() {
    var copyTextarea = document.querySelector('.TwoGalaxies-shareText');
    var outcomeElement = document.querySelector('.TwoGalaxies-copyOutcome');

    copyToClipboard(copyTextarea).then(
      () => {
        outcomeElement.innerHTML = "Copied";
        let button = document.querySelector(".TwoGalaxies-copyToClipboardButton");
        copyTextarea.classList.add("TwoGalaxies--isHidden");
        button.classList.add("TwoGalaxies--isHidden");
      },
      (err) => outcomeElement.innerHTML = "Error: " + err);
}

function hideAllControls() {
  var sliders = document.querySelectorAll(".SickSlider");

  // Hide all sliders
  sliders.forEach((slider) => slider.classList.add("SickSlider--isHidden"));

  // Hide share container
  var container = document.querySelector(".TwoGalaxies-shareContainer");
  container.classList.add("TwoGalaxies--isHidden");
}

function didClickSliderButton(selectors) {
  return (e) => {
    hideAllControls();

    // Show the current sliders
    selectors.forEach((selector) => {
      document.querySelector(selector).classList.remove("SickSlider--isHidden");
    });

    return false; // Prevent default
  };
}

function initSliderButton(buttonSelector, sliderSelectors) {
  var button = document.querySelector(buttonSelector);
  button.onclick = didClickSliderButton(sliderSelectors);
}


/**
 * Start detecting the button click.
 *
 * @param  {object} initialParams Initial parameters of the simulation.
 * @param  {object} currentParams Current parameters of the simulation.
 */
export function init(initialParams, currentParams) {
  // Restart simulation button
  var button = document.querySelector(".TwoGalaxies-restartButton");
  button.onclick = didClickRestart(currentParams);

  // Reverse time button
  // ------------

  var reverseTimeButton = document.querySelector(".TwoGalaxies-reverseTimeButton");
  var reverseTime2Button = document.querySelector(".TwoGalaxies-reverseTime2Button");
  var buttons = [reverseTimeButton, reverseTime2Button];

  reverseTimeButton.onclick = didClickReverseTime(currentParams, buttons);
  reverseTime2Button.onclick = didClickReverseTime(currentParams, buttons);

  // Pause/resume
  // ------------

  var pauseButton = document.querySelector(".TwoGalaxies-pauseButton");
  var resumeButton = document.querySelector(".TwoGalaxies-resumeButton");
  buttons = [pauseButton, resumeButton];
  pauseButton.onclick = didClickPause(currentParams, buttons);
  resumeButton.onclick = didClickResume(currentParams, buttons);

  stopClickPropagation("mousedown", ".TwoGalaxies-button");
  stopClickPropagation("touchstart", ".TwoGalaxies-button");

  // Fast forward / rewind
  // --------

  var fastForwardSeconds = 5;
  button = document.querySelector(".TwoGalaxies-fastForwardButton");
  button.onclick = didClickFastForward(currentParams, fastForwardSeconds);

  fastForwardSeconds = -5;
  button = document.querySelector(".TwoGalaxies-fastBackwardButton");
  button.onclick = didClickFastForward(currentParams, fastForwardSeconds);

  // Share
  // --------

  button = document.querySelector(".TwoGalaxies-shareButton");
  button.onclick = didClickShare(initialParams, currentParams);

  // Copy to clipboard
  // --------

  button = document.querySelector(".TwoGalaxies-copyToClipboardButton");
  button.onclick = didClickCopyToClipboard;


  // Buttons for showing sliders
  // -----------

  var sliderButtonSelectors = {
    ".TwoGalaxies-timeStepButton": [".TwoGalaxies-sliderTimeStep"],
    ".TwoGalaxies-numberOfRingsButton": [
      ".TwoGalaxies-sliderRings1",
      ".TwoGalaxies-sliderRings2"
    ],
    ".TwoGalaxies-massButton": [
      ".TwoGalaxies-sliderMass1",
      ".TwoGalaxies-sliderMass2"
    ],
    ".TwoGalaxies-distanceButton": [".TwoGalaxies-sliderDistance"],
    ".TwoGalaxies-eccentricityButton": [".TwoGalaxies-sliderEccentricity"],
    ".TwoGalaxies-angleButton": [
      ".TwoGalaxies-sliderAngle1",
      ".TwoGalaxies-sliderAngle2"
    ],
    ".TwoGalaxies-ringSeparationButton": [".TwoGalaxies-sliderRingSeparation"],
  };

  for (let buttonSelector in sliderButtonSelectors) {
    var sliderSelectors = sliderButtonSelectors[buttonSelector];
    initSliderButton(buttonSelector, sliderSelectors);
  }
}
