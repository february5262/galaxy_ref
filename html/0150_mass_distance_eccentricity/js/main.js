// The entry point of the program.
// Initialises graphics and runs the simulation.

import { initGraphics, loadColors } from './graphics.js';
import drawScene from './render.js';
import * as simulation from './simulation.js';
import { measureRefreshRate } from './refresh_rate.js';
import {init as initUserInput} from './user_input.js';
import * as showFps from './show_fps.js';
import { updateCameraDistance } from './zoom.js';
import { getInitialParameters } from './share.js';

function onNextFrame(drawData, initialParams, currentParams, fpsState) {
  return function(now) {
    showFps.update(now, fpsState);

    if (currentParams.positions === null) { // First frame
      // calculate initial positions of the bodies
      simulation.setInitial(initialParams, currentParams);
      updateCameraDistance(currentParams);
      console.log(`Number of bodies: ${currentParams.positions.length / 3}`);
    } else {
      // Update positions of the bodies at new time
      simulation.update(initialParams, currentParams);
    }

    drawScene(drawData, currentParams);

    requestAnimationFrame(onNextFrame(drawData, initialParams,
                                      currentParams, fpsState));
  };
}

// Restart the simulation
function restart(drawData, initialParams, currentParams, reloadColors=false) {
  currentParams.positions = null;
  currentParams.velocities = null;
  currentParams.accelerations = null;

  // Recalculate the zoom
  currentParams.zoomState.cameraDistance = null;

  if (reloadColors) loadColors(drawData, initialParams);
}

function main(screenRefreshRateFPS) {
  // Initial parameters of the simulation, they can't be changed without restart
  var initialParams = {
    numberOfRings: [5, 5],
    colors: [[255, 127, 0], [0, 100, 255]],
    ringSeparation: 3,
    minimalGalaxySeparation: 25,
    galaxyInclinationAnglesDegree: [60, 60],
    masses: [1, 1],
    eccentricity: 0.6
  };

  initialParams = getInitialParameters(initialParams);

  // Parameters that can change during the simulation
  var currentParams = {
    // Current positions, velocities and accelerations of all the bodies.
    positions: null,
    velocities: null,
    accelerations: null,

    // User is rotating the scene
    rotating: false,

    paused: false,

    // The approximate detected refresh rate of the screen, in
    // number of frames per second (FPS). At each frame, the simulation
    // time is advanced by `timeStep` and then drawn on the screen
    screenRefreshRateFPS: screenRefreshRateFPS,

    // The amount of time the simulation is advanced after each
    // screen refresh frame. The number is always positive.
    // To simulate back in time, set timeDirection to -1.
    timeStep: simulation.calculateTimeStep(screenRefreshRateFPS),

    // Number of seconds to fast forward the simulation. The number
    // can be negative, which means we want to go back in simulation time.
    fastForwardSeconds: 0,

    // Direction of time. 1 for forward, -1 for backward.
    timeDirection: 1,

    // Objects containing zoom and rotation information
    rotateState: null,
    zoomState: null
  };

  var drawData = initGraphics(initialParams);

  initUserInput(drawData, initialParams, currentParams,
    (reloadColors) => restart(drawData, initialParams, currentParams, reloadColors));

  var fpsState = showFps.init();

  // Run the animation
  requestAnimationFrame(onNextFrame(drawData, initialParams,
                                    currentParams, fpsState));
}

window.onload = () => measureRefreshRate(20).then(fps => main(fps));
