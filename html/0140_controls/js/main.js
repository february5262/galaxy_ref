import { initGraphics } from './graphics.js';
import drawScene from './render.js';
import * as simulation from './simulation.js';
import measureRefreshRate from './refresh_rate.js';
import {init as initUserInput} from './user_input.js';

function onNextFrame(drawData, initialParams, currentParams) {
  return function(now) {
    if (currentParams.positions === null) { // First frame
      // calculate initial positions of the bodies
      simulation.setInitial(initialParams, currentParams);
    } else {
      // Update positions of the bodies at new time
      simulation.update(currentParams.timeStep, initialParams, currentParams);
    }

    drawScene(drawData, currentParams);
    requestAnimationFrame(onNextFrame(drawData, initialParams, currentParams));
  };
}

function main(screenRefreshRateFPS) {
  // Initial parameters of the simulation, they can't be changed without restart
  var initialParams = {
    numberOfRings: [5, 5],
    colors: [[255, 127, 0], [0, 100, 255]],
    ringSeparation: 3,
    minimalGalaxySeparation: 25,
    galaxyInclinationAngles: [60 * Math.PI / 180, 60 * Math.PI / 180],
    masses: [1, 1],
    eccentricity: 0.6
  };

  // Parameters that can change during the simulation
  var currentParams = {
    // Current positions, velocities and accelerations of all the bodies.
    positions: null,
    velocities: null,
    accelerations: null,
    rotating: false // User is rotating the scene
  };

  // Make the speed of the simulation independent of refresh rate of the screen
  // by using smaller time step for higher refresh rates.
  // Use time step of 1 for 60 FPS screen.
  // Round refresh to first significant figure
  screenRefreshRateFPS = (Math.round(screenRefreshRateFPS / 10) * 10);
  currentParams.timeStep = 60 / screenRefreshRateFPS;

  var drawData = initGraphics(initialParams);

  initUserInput(drawData, currentParams);

  requestAnimationFrame(onNextFrame(drawData, initialParams, currentParams));
}

window.onload = () => measureRefreshRate(20).then(fps => main(fps));
